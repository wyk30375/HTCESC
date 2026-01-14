
-- 添加销售记录约束，防止数据不一致和重复销售

-- ============================================
-- 1. 添加检查约束：确保销售记录和车辆的 dealership_id 一致
-- ============================================

-- 首先删除可能存在的旧约束
ALTER TABLE vehicle_sales 
DROP CONSTRAINT IF EXISTS vehicle_sales_dealership_match;

-- 创建函数检查 dealership_id 是否匹配
CREATE OR REPLACE FUNCTION check_vehicle_dealership_match()
RETURNS TRIGGER AS $$
BEGIN
  -- 检查车辆的 dealership_id 是否与销售记录的 dealership_id 一致
  IF NOT EXISTS (
    SELECT 1 FROM vehicles 
    WHERE id = NEW.vehicle_id 
    AND dealership_id = NEW.dealership_id
  ) THEN
    RAISE EXCEPTION '不能销售其他车行的车辆';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS check_vehicle_dealership_match_trigger ON vehicle_sales;
CREATE TRIGGER check_vehicle_dealership_match_trigger
  BEFORE INSERT OR UPDATE ON vehicle_sales
  FOR EACH ROW
  EXECUTE FUNCTION check_vehicle_dealership_match();

-- ============================================
-- 2. 添加检查约束：确保车辆状态为 in_stock 才能销售
-- ============================================

-- 创建函数检查车辆状态
CREATE OR REPLACE FUNCTION check_vehicle_available_for_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- 检查车辆是否在库
  IF NOT EXISTS (
    SELECT 1 FROM vehicles 
    WHERE id = NEW.vehicle_id 
    AND status = 'in_stock'
  ) THEN
    RAISE EXCEPTION '该车辆不在库或已售出，不能创建销售记录';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS check_vehicle_available_trigger ON vehicle_sales;
CREATE TRIGGER check_vehicle_available_trigger
  BEFORE INSERT ON vehicle_sales
  FOR EACH ROW
  EXECUTE FUNCTION check_vehicle_available_for_sale();

-- ============================================
-- 3. 添加触发器：自动更新车辆状态为 sold
-- ============================================

-- 创建函数自动更新车辆状态
CREATE OR REPLACE FUNCTION auto_update_vehicle_status()
RETURNS TRIGGER AS $$
BEGIN
  -- 创建销售记录后，自动将车辆状态更新为 sold
  UPDATE vehicles 
  SET status = 'sold', updated_at = NOW()
  WHERE id = NEW.vehicle_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS auto_update_vehicle_status_trigger ON vehicle_sales;
CREATE TRIGGER auto_update_vehicle_status_trigger
  AFTER INSERT ON vehicle_sales
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_vehicle_status();

-- ============================================
-- 4. 添加触发器：删除销售记录时恢复车辆状态
-- ============================================

-- 创建函数恢复车辆状态
CREATE OR REPLACE FUNCTION restore_vehicle_status()
RETURNS TRIGGER AS $$
BEGIN
  -- 删除销售记录后，将车辆状态恢复为 in_stock
  UPDATE vehicles 
  SET status = 'in_stock', updated_at = NOW()
  WHERE id = OLD.vehicle_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS restore_vehicle_status_trigger ON vehicle_sales;
CREATE TRIGGER restore_vehicle_status_trigger
  AFTER DELETE ON vehicle_sales
  FOR EACH ROW
  EXECUTE FUNCTION restore_vehicle_status();

-- 返回结果
SELECT 'Vehicle sales constraints added successfully' AS status;
