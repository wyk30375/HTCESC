-- 创建函数：检查会员状态
CREATE OR REPLACE FUNCTION check_membership_status(p_dealership_id UUID)
RETURNS JSON AS $$
DECLARE
  v_membership RECORD;
  v_tier RECORD;
  v_vehicle_count INTEGER;
  v_days_remaining INTEGER;
  v_is_active BOOLEAN;
  v_is_trial BOOLEAN;
  v_status TEXT;
BEGIN
  -- 获取在售车辆数量
  SELECT COUNT(*) INTO v_vehicle_count
  FROM vehicles
  WHERE dealership_id = p_dealership_id
    AND status = 'in_stock';
  
  -- 获取当前会员信息
  SELECT 
    dm.*,
    mt.tier_name,
    mt.tier_level,
    mt.annual_fee,
    mt.min_vehicles,
    mt.max_vehicles
  INTO v_membership
  FROM dealership_memberships dm
  JOIN membership_tiers mt ON dm.tier_id = mt.id
  WHERE dm.dealership_id = p_dealership_id
  ORDER BY dm.created_at DESC
  LIMIT 1;
  
  -- 如果没有会员记录，返回未激活状态
  IF NOT FOUND THEN
    RETURN json_build_object(
      'hasActiveMembership', FALSE,
      'isActive', FALSE,
      'isTrial', FALSE,
      'vehicleCount', v_vehicle_count,
      'daysRemaining', 0,
      'status', 'no_membership',
      'message', '未开通会员'
    );
  END IF;
  
  -- 计算剩余天数
  IF v_membership.is_trial THEN
    v_days_remaining := EXTRACT(DAY FROM (v_membership.trial_end_date - CURRENT_DATE));
    v_is_trial := TRUE;
  ELSE
    v_days_remaining := EXTRACT(DAY FROM (v_membership.end_date - CURRENT_DATE));
    v_is_trial := FALSE;
  END IF;
  
  -- 判断是否激活
  v_is_active := v_membership.status = 'active' AND v_days_remaining >= 0;
  
  -- 确定状态
  IF v_is_active THEN
    IF v_is_trial THEN
      v_status := 'trial';
    ELSIF v_days_remaining <= 7 THEN
      v_status := 'expiring_soon';
    ELSE
      v_status := 'active';
    END IF;
  ELSE
    v_status := 'expired';
  END IF;
  
  -- 获取推荐的会员等级
  SELECT * INTO v_tier
  FROM membership_tiers
  WHERE v_vehicle_count >= min_vehicles
    AND (max_vehicles IS NULL OR v_vehicle_count <= max_vehicles)
  ORDER BY tier_level ASC
  LIMIT 1;
  
  -- 返回完整状态
  RETURN json_build_object(
    'hasActiveMembership', TRUE,
    'isActive', v_is_active,
    'isTrial', v_is_trial,
    'vehicleCount', v_vehicle_count,
    'daysRemaining', v_days_remaining,
    'status', v_status,
    'membership', row_to_json(v_membership),
    'recommendedTier', row_to_json(v_tier),
    'startDate', v_membership.start_date,
    'endDate', CASE WHEN v_is_trial THEN v_membership.trial_end_date ELSE v_membership.end_date END,
    'tierName', v_membership.tier_name,
    'tierLevel', v_membership.tier_level,
    'annualFee', v_membership.annual_fee
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建函数：获取当前会员信息
CREATE OR REPLACE FUNCTION get_current_membership(p_dealership_id UUID)
RETURNS JSON AS $$
DECLARE
  v_membership RECORD;
BEGIN
  SELECT 
    dm.*,
    mt.tier_name,
    mt.tier_level,
    mt.annual_fee,
    mt.min_vehicles,
    mt.max_vehicles,
    mt.description
  INTO v_membership
  FROM dealership_memberships dm
  JOIN membership_tiers mt ON dm.tier_id = mt.id
  WHERE dm.dealership_id = p_dealership_id
    AND dm.status = 'active'
  ORDER BY dm.created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  RETURN row_to_json(v_membership);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建函数：续费会员
CREATE OR REPLACE FUNCTION renew_membership(
  p_dealership_id UUID,
  p_tier_id UUID,
  p_payment_method TEXT,
  p_amount DECIMAL,
  p_transaction_id TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_membership_id UUID;
  v_payment_id UUID;
  v_start_date DATE;
  v_end_date DATE;
  v_current_membership RECORD;
BEGIN
  -- 获取当前会员信息
  SELECT * INTO v_current_membership
  FROM dealership_memberships
  WHERE dealership_id = p_dealership_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- 确定开始日期和结束日期
  IF FOUND AND v_current_membership.end_date > CURRENT_DATE THEN
    -- 如果当前会员未过期，从当前结束日期开始
    v_start_date := v_current_membership.end_date;
    v_end_date := v_current_membership.end_date + INTERVAL '1 year';
    
    -- 更新当前会员状态为已取消
    UPDATE dealership_memberships
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE id = v_current_membership.id;
  ELSE
    -- 如果没有会员或已过期，从今天开始
    v_start_date := CURRENT_DATE;
    v_end_date := CURRENT_DATE + INTERVAL '1 year';
  END IF;
  
  -- 创建新的会员记录
  INSERT INTO dealership_memberships (
    dealership_id,
    tier_id,
    start_date,
    end_date,
    is_trial,
    status
  ) VALUES (
    p_dealership_id,
    p_tier_id,
    v_start_date,
    v_end_date,
    FALSE,
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
    p_dealership_id,
    p_amount,
    p_payment_method,
    'completed',
    NOW(),
    p_transaction_id,
    p_notes
  ) RETURNING id INTO v_payment_id;
  
  RETURN json_build_object(
    'success', TRUE,
    'membership_id', v_membership_id,
    'payment_id', v_payment_id,
    'start_date', v_start_date,
    'end_date', v_end_date,
    'message', '续费成功'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;