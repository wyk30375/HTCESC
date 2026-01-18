-- 修复 get_dealership_vehicle_count 函数，使用正确的车辆状态
CREATE OR REPLACE FUNCTION get_dealership_vehicle_count(p_dealership_id UUID)
RETURNS INTEGER AS $$
DECLARE
  vehicle_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO vehicle_count
  FROM vehicles
  WHERE dealership_id = p_dealership_id
    AND status = 'in_stock';  -- 修复：使用 'in_stock' 而不是 'available'
  
  RETURN COALESCE(vehicle_count, 0);
END;
$$ LANGUAGE plpgsql;

-- 同时修复 update_dealership_membership_tier 函数
CREATE OR REPLACE FUNCTION update_dealership_membership_tier(p_dealership_id UUID)
RETURNS VOID AS $$
DECLARE
  v_vehicle_count INTEGER;
  v_new_tier_id UUID;
  v_current_membership RECORD;
BEGIN
  -- 获取在售车辆数量
  SELECT COUNT(*) INTO v_vehicle_count
  FROM vehicles
  WHERE dealership_id = p_dealership_id
    AND status = 'in_stock';  -- 修复：使用 'in_stock'
  
  -- 获取当前会员信息
  SELECT * INTO v_current_membership
  FROM dealership_memberships
  WHERE dealership_id = p_dealership_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- 如果没有会员记录，不做任何操作
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- 根据车辆数量计算新的会员等级
  SELECT id INTO v_new_tier_id
  FROM membership_tiers
  WHERE v_vehicle_count >= min_vehicles
    AND (max_vehicles IS NULL OR v_vehicle_count <= max_vehicles)
  ORDER BY tier_level ASC
  LIMIT 1;
  
  -- 如果等级发生变化，更新会员记录
  IF v_new_tier_id IS NOT NULL AND v_new_tier_id != v_current_membership.tier_id THEN
    UPDATE dealership_memberships
    SET tier_id = v_new_tier_id,
        updated_at = NOW()
    WHERE id = v_current_membership.id;
  END IF;
END;
$$ LANGUAGE plpgsql;