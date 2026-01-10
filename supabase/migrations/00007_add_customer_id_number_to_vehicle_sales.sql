-- 添加客户身份证号字段到 vehicle_sales 表
ALTER TABLE vehicle_sales
ADD COLUMN IF NOT EXISTS customer_id_number TEXT;

-- 添加注释
COMMENT ON COLUMN vehicle_sales.customer_id_number IS '客户身份证号';