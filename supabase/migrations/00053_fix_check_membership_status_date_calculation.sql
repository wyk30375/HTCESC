-- 修复 check_membership_status 函数的日期计算
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
  
  -- 计算剩余天数（修复：使用正确的日期计算方式）
  IF v_membership.is_trial THEN
    v_days_remaining := (v_membership.trial_end_date - CURRENT_DATE)::INTEGER;
    v_is_trial := TRUE;
  ELSE
    v_days_remaining := (v_membership.end_date - CURRENT_DATE)::INTEGER;
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