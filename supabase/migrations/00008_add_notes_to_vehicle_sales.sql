-- 添加备注字段到 vehicle_sales 表
ALTER TABLE vehicle_sales
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 添加注释
COMMENT ON COLUMN vehicle_sales.notes IS '销售备注';