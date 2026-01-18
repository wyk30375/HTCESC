-- 创建支付订单表
CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no TEXT NOT NULL UNIQUE,
  dealership_id UUID NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES membership_tiers(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'qrcode' CHECK (payment_method IN ('qrcode', 'wechat', 'alipay')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paying', 'paid', 'cancelled', 'expired')),
  qr_code_url TEXT,
  expired_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_payment_orders_dealership ON payment_orders(dealership_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_no ON payment_orders(order_no);

-- 启用RLS
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- 支付订单表策略
CREATE POLICY "车商可查看自己的支付订单" ON payment_orders
  FOR SELECT TO authenticated
  USING (
    dealership_id IN (
      SELECT dealership_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "车商可创建自己的支付订单" ON payment_orders
  FOR INSERT TO authenticated
  WITH CHECK (
    dealership_id IN (
      SELECT dealership_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "超级管理员可查看所有支付订单" ON payment_orders
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "超级管理员可管理支付订单" ON payment_orders
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 创建函数：生成订单号
CREATE OR REPLACE FUNCTION generate_order_no()
RETURNS TEXT AS $$
DECLARE
  order_no TEXT;
  exists_flag BOOLEAN;
BEGIN
  LOOP
    -- 生成订单号：PO + 年月日 + 6位随机数
    order_no := 'PO' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- 检查是否已存在
    SELECT EXISTS(SELECT 1 FROM payment_orders WHERE order_no = order_no) INTO exists_flag;
    
    -- 如果不存在，返回订单号
    IF NOT exists_flag THEN
      RETURN order_no;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 创建函数：创建支付订单
CREATE OR REPLACE FUNCTION create_payment_order(
  p_dealership_id UUID,
  p_tier_id UUID,
  p_payment_method TEXT DEFAULT 'qrcode'
)
RETURNS JSON AS $$
DECLARE
  v_order_no TEXT;
  v_amount DECIMAL(10, 2);
  v_order_id UUID;
  v_expired_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- 获取会员等级价格
  SELECT annual_fee INTO v_amount
  FROM membership_tiers
  WHERE id = p_tier_id;
  
  IF v_amount IS NULL THEN
    RAISE EXCEPTION '会员等级不存在';
  END IF;
  
  -- 生成订单号
  v_order_no := generate_order_no();
  
  -- 设置过期时间（30分钟后）
  v_expired_at := NOW() + INTERVAL '30 minutes';
  
  -- 创建订单
  INSERT INTO payment_orders (
    order_no,
    dealership_id,
    tier_id,
    amount,
    payment_method,
    status,
    expired_at
  ) VALUES (
    v_order_no,
    p_dealership_id,
    p_tier_id,
    v_amount,
    p_payment_method,
    'pending',
    v_expired_at
  ) RETURNING id INTO v_order_id;
  
  -- 返回订单信息
  RETURN json_build_object(
    'order_id', v_order_id,
    'order_no', v_order_no,
    'amount', v_amount,
    'expired_at', v_expired_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建函数：处理支付成功
CREATE OR REPLACE FUNCTION process_payment_success(
  p_order_no TEXT
)
RETURNS JSON AS $$
DECLARE
  v_order RECORD;
  v_membership_id UUID;
  v_payment_id UUID;
  v_result JSON;
BEGIN
  -- 获取订单信息
  SELECT * INTO v_order
  FROM payment_orders
  WHERE order_no = p_order_no
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '订单不存在';
  END IF;
  
  -- 检查订单状态
  IF v_order.status = 'paid' THEN
    RAISE EXCEPTION '订单已支付';
  END IF;
  
  IF v_order.status = 'expired' THEN
    RAISE EXCEPTION '订单已过期';
  END IF;
  
  IF v_order.status = 'cancelled' THEN
    RAISE EXCEPTION '订单已取消';
  END IF;
  
  -- 更新订单状态
  UPDATE payment_orders
  SET status = 'paid',
      paid_at = NOW(),
      updated_at = NOW()
  WHERE order_no = p_order_no;
  
  -- 创建会员记录
  INSERT INTO dealership_memberships (
    dealership_id,
    tier_id,
    start_date,
    end_date,
    is_trial,
    trial_end_date,
    status
  ) VALUES (
    v_order.dealership_id,
    v_order.tier_id,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    FALSE,
    NULL,
    'active'
  ) RETURNING id INTO v_membership_id;
  
  -- 创建支付记录
  INSERT INTO membership_payments (
    membership_id,
    dealership_id,
    amount,
    payment_method,
    payment_status,
    payment_date,
    transaction_id,
    notes
  ) VALUES (
    v_membership_id,
    v_order.dealership_id,
    v_order.amount,
    v_order.payment_method,
    'completed',
    NOW(),
    v_order.order_no,
    '在线支付'
  ) RETURNING id INTO v_payment_id;
  
  -- 返回结果
  v_result := json_build_object(
    'success', TRUE,
    'membership_id', v_membership_id,
    'payment_id', v_payment_id,
    'message', '支付成功，会员已开通'
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建函数：检查订单状态
CREATE OR REPLACE FUNCTION check_order_status(
  p_order_no TEXT
)
RETURNS JSON AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT 
    po.*,
    mt.tier_name,
    mt.annual_fee,
    d.name as dealership_name
  INTO v_order
  FROM payment_orders po
  JOIN membership_tiers mt ON po.tier_id = mt.id
  JOIN dealerships d ON po.dealership_id = d.id
  WHERE po.order_no = p_order_no;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', '订单不存在'
    );
  END IF;
  
  RETURN json_build_object(
    'success', TRUE,
    'order', row_to_json(v_order)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建函数：取消过期订单
CREATE OR REPLACE FUNCTION cancel_expired_orders()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE payment_orders
  SET status = 'expired',
      updated_at = NOW()
  WHERE status IN ('pending', 'paying')
    AND expired_at < NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 创建定时任务（需要pg_cron扩展，如果没有则手动执行）
-- SELECT cron.schedule('cancel-expired-orders', '*/5 * * * *', 'SELECT cancel_expired_orders();');