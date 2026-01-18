-- 创建会员等级表
CREATE TABLE IF NOT EXISTS membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE,
  tier_level INTEGER NOT NULL UNIQUE,
  min_vehicles INTEGER NOT NULL,
  max_vehicles INTEGER,
  annual_fee DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入会员等级数据
INSERT INTO membership_tiers (tier_name, tier_level, min_vehicles, max_vehicles, annual_fee, description) VALUES
('三级会员', 3, 0, 20, 198.00, '在售车辆20台以内'),
('二级会员', 2, 21, 50, 365.00, '在售车辆21-50台'),
('一级会员', 1, 51, 150, 580.00, '在售车辆51-150台'),
('金牌会员', 0, 151, NULL, 980.00, '在售车辆151台以上');

-- 创建会员订阅表
CREATE TABLE IF NOT EXISTS dealership_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id UUID NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES membership_tiers(id),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_trial BOOLEAN DEFAULT TRUE,
  trial_end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dealership_id, start_date)
);

-- 创建支付记录表
CREATE TABLE IF NOT EXISTS membership_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL REFERENCES dealership_memberships(id) ON DELETE CASCADE,
  dealership_id UUID NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_date TIMESTAMP WITH TIME ZONE,
  transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_dealership_memberships_dealership ON dealership_memberships(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dealership_memberships_status ON dealership_memberships(status);
CREATE INDEX IF NOT EXISTS idx_dealership_memberships_end_date ON dealership_memberships(end_date);
CREATE INDEX IF NOT EXISTS idx_membership_payments_dealership ON membership_payments(dealership_id);
CREATE INDEX IF NOT EXISTS idx_membership_payments_status ON membership_payments(payment_status);

-- 启用RLS
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealership_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_payments ENABLE ROW LEVEL SECURITY;

-- 会员等级表策略（所有人可读）
CREATE POLICY "会员等级表公开可读" ON membership_tiers
  FOR SELECT TO authenticated
  USING (true);

-- 会员订阅表策略
CREATE POLICY "车商可查看自己的会员信息" ON dealership_memberships
  FOR SELECT TO authenticated
  USING (
    dealership_id IN (
      SELECT dealership_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "超级管理员可查看所有会员信息" ON dealership_memberships
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "超级管理员可管理会员信息" ON dealership_memberships
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 支付记录表策略
CREATE POLICY "车商可查看自己的支付记录" ON membership_payments
  FOR SELECT TO authenticated
  USING (
    dealership_id IN (
      SELECT dealership_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "超级管理员可查看所有支付记录" ON membership_payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "超级管理员可管理支付记录" ON membership_payments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 创建函数：根据车辆数量计算会员等级
CREATE OR REPLACE FUNCTION calculate_membership_tier(vehicle_count INTEGER)
RETURNS UUID AS $$
DECLARE
  tier_id UUID;
BEGIN
  SELECT id INTO tier_id
  FROM membership_tiers
  WHERE vehicle_count >= min_vehicles
    AND (max_vehicles IS NULL OR vehicle_count <= max_vehicles)
  ORDER BY tier_level ASC
  LIMIT 1;
  
  RETURN tier_id;
END;
$$ LANGUAGE plpgsql;

-- 创建函数：获取车商当前在售车辆数量
CREATE OR REPLACE FUNCTION get_dealership_vehicle_count(p_dealership_id UUID)
RETURNS INTEGER AS $$
DECLARE
  vehicle_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO vehicle_count
  FROM vehicles
  WHERE dealership_id = p_dealership_id
    AND status = 'available';
  
  RETURN COALESCE(vehicle_count, 0);
END;
$$ LANGUAGE plpgsql;

-- 创建函数：初始化车商会员（审核通过时调用）
CREATE OR REPLACE FUNCTION initialize_dealership_membership(p_dealership_id UUID)
RETURNS UUID AS $$
DECLARE
  v_tier_id UUID;
  v_membership_id UUID;
  v_trial_end_date DATE;
  v_vehicle_count INTEGER;
BEGIN
  -- 检查是否已有会员记录
  SELECT id INTO v_membership_id
  FROM dealership_memberships
  WHERE dealership_id = p_dealership_id
  LIMIT 1;
  
  IF v_membership_id IS NOT NULL THEN
    RETURN v_membership_id;
  END IF;
  
  -- 获取当前车辆数量
  v_vehicle_count := get_dealership_vehicle_count(p_dealership_id);
  
  -- 计算会员等级
  v_tier_id := calculate_membership_tier(v_vehicle_count);
  
  -- 计算免费期结束日期（6个月后）
  v_trial_end_date := CURRENT_DATE + INTERVAL '6 months';
  
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
    p_dealership_id,
    v_tier_id,
    CURRENT_DATE,
    v_trial_end_date,
    TRUE,
    v_trial_end_date,
    'active'
  ) RETURNING id INTO v_membership_id;
  
  RETURN v_membership_id;
END;
$$ LANGUAGE plpgsql;

-- 创建函数：更新车商会员等级（车辆数量变化时调用）
CREATE OR REPLACE FUNCTION update_dealership_membership_tier(p_dealership_id UUID)
RETURNS VOID AS $$
DECLARE
  v_vehicle_count INTEGER;
  v_new_tier_id UUID;
  v_current_tier_id UUID;
  v_membership_id UUID;
BEGIN
  -- 获取当前车辆数量
  v_vehicle_count := get_dealership_vehicle_count(p_dealership_id);
  
  -- 计算新的会员等级
  v_new_tier_id := calculate_membership_tier(v_vehicle_count);
  
  -- 获取当前会员信息
  SELECT id, tier_id INTO v_membership_id, v_current_tier_id
  FROM dealership_memberships
  WHERE dealership_id = p_dealership_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- 如果等级发生变化，更新会员记录
  IF v_new_tier_id IS NOT NULL AND v_new_tier_id != v_current_tier_id THEN
    UPDATE dealership_memberships
    SET tier_id = v_new_tier_id,
        updated_at = NOW()
    WHERE id = v_membership_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器：车辆状态变更时更新会员等级
CREATE OR REPLACE FUNCTION trigger_update_membership_on_vehicle_change()
RETURNS TRIGGER AS $$
BEGIN
  -- 只在车辆状态变为或离开available时更新
  IF (TG_OP = 'INSERT' AND NEW.status = 'available') OR
     (TG_OP = 'UPDATE' AND OLD.status != NEW.status AND (NEW.status = 'available' OR OLD.status = 'available')) OR
     (TG_OP = 'DELETE' AND OLD.status = 'available') THEN
    
    PERFORM update_dealership_membership_tier(COALESCE(NEW.dealership_id, OLD.dealership_id));
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_membership_on_vehicle_change ON vehicles;
CREATE TRIGGER update_membership_on_vehicle_change
  AFTER INSERT OR UPDATE OR DELETE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_membership_on_vehicle_change();

-- 为已存在的已审核车商初始化会员
DO $$
DECLARE
  dealership_record RECORD;
BEGIN
  FOR dealership_record IN 
    SELECT id FROM dealerships WHERE status = 'approved'
  LOOP
    PERFORM initialize_dealership_membership(dealership_record.id);
  END LOOP;
END $$;