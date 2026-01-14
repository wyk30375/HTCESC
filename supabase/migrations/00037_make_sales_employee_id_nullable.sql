
-- 将 vehicle_sales 表的 sales_employee_id 字段改为可选
ALTER TABLE vehicle_sales 
ALTER COLUMN sales_employee_id DROP NOT NULL;

-- 添加注释说明
COMMENT ON COLUMN vehicle_sales.sales_employee_id IS '销售员工ID（可选，兼容旧字段）';
COMMENT ON COLUMN vehicle_sales.salesperson_id IS '销售员ID（可选，新字段）';
