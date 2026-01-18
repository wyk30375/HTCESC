-- 创建函数：检查车辆数量是否超过会员等级限制
CREATE OR REPLACE FUNCTION check_vehicle_limit(p_dealership_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_count INTEGER;
  v_max_vehicles INTEGER;
  v_tier_name TEXT;
  v_membership_id UUID;
BEGIN
  -- 获取当前在售车辆数量
  SELECT COUNT(*) INTO v_current_count
  FROM vehicles
  WHERE dealership_id = p_dealership_id
    AND status = 'in_stock';
  
  -- 获取会员等级限制
  SELECT 
    dm.id,
    mt.max_vehicles,
    mt.tier_name
  INTO 
    v_membership_id,
    v_max_vehicles,
    v_tier_name
  FROM dealership_memberships dm
  JOIN membership_tiers mt ON dm.tier_id = mt.id
  WHERE dm.dealership_id = p_dealership_id
    AND dm.status = 'active'
  ORDER BY dm.created_at DESC
  LIMIT 1;
  
  -- 如果没有会员记录，返回未开通状态
  IF v_membership_id IS NULL THEN
    RETURN json_build_object(
      'allowed', false,
      'current_count', v_current_count,
      'max_vehicles', 0,
      'tier_name', null,
      'message', '未开通会员，请先开通会员后再添加车辆'
    );
  END IF;
  
  -- 检查是否超限（max_vehicles为NULL表示无限制）
  IF v_max_vehicles IS NULL THEN
    RETURN json_build_object(
      'allowed', true,
      'current_count', v_current_count,
      'max_vehicles', null,
      'tier_name', v_tier_name,
      'message', '当前会员等级无车辆数量限制'
    );
  END IF;
  
  -- 检查是否达到上限
  IF v_current_count >= v_max_vehicles THEN
    RETURN json_build_object(
      'allowed', false,
      'current_count', v_current_count,
      'max_vehicles', v_max_vehicles,
      'tier_name', v_tier_name,
      'message', '已达到' || v_tier_name || '的车辆数量上限（' || v_max_vehicles || '台），请升级会员后继续添加'
    );
  END IF;
  
  -- 允许添加
  RETURN json_build_object(
    'allowed', true,
    'current_count', v_current_count,
    'max_vehicles', v_max_vehicles,
    'tier_name', v_tier_name,
    'message', '可以添加车辆，当前' || v_current_count || '/' || v_max_vehicles || '台'
  );
END;
$$;

-- 创建触发器函数：在添加车辆前检查数量限制
CREATE OR REPLACE FUNCTION check_vehicle_limit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_check_result JSON;
  v_allowed BOOLEAN;
  v_message TEXT;
BEGIN
  -- 只在INSERT和状态变为in_stock时检查
  IF (TG_OP = 'INSERT' AND NEW.status = 'in_stock') OR
     (TG_OP = 'UPDATE' AND OLD.status != 'in_stock' AND NEW.status = 'in_stock') THEN
    
    -- 检查车辆数量限制
    v_check_result := check_vehicle_limit(NEW.dealership_id);
    v_allowed := (v_check_result->>'allowed')::boolean;
    v_message := v_check_result->>'message';
    
    -- 如果不允许，抛出异常
    IF NOT v_allowed THEN
      RAISE EXCEPTION '%', v_message;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_check_vehicle_limit ON vehicles;
CREATE TRIGGER trigger_check_vehicle_limit
  BEFORE INSERT OR UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION check_vehicle_limit_trigger();