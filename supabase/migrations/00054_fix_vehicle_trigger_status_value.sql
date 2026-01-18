-- 修复车辆变更触发器中的状态值
CREATE OR REPLACE FUNCTION trigger_update_membership_on_vehicle_change()
RETURNS TRIGGER AS $$
BEGIN
  -- 只有在售车辆状态变更时才更新会员等级
  IF (TG_OP = 'INSERT' AND NEW.status = 'in_stock') OR
     (TG_OP = 'UPDATE' AND OLD.status != NEW.status AND (NEW.status = 'in_stock' OR OLD.status = 'in_stock')) OR
     (TG_OP = 'DELETE' AND OLD.status = 'in_stock')
  THEN
    -- 更新车商的会员等级
    IF TG_OP = 'DELETE' THEN
      PERFORM update_dealership_membership_tier(OLD.dealership_id);
    ELSE
      PERFORM update_dealership_membership_tier(NEW.dealership_id);
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;