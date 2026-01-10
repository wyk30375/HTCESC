-- 删除旧的外键约束
ALTER TABLE vehicle_sales 
DROP CONSTRAINT IF EXISTS vehicle_sales_sales_employee_id_fkey;

-- 添加新的外键约束，引用 profiles 表
ALTER TABLE vehicle_sales 
ADD CONSTRAINT vehicle_sales_sales_employee_id_fkey 
FOREIGN KEY (sales_employee_id) 
REFERENCES profiles(id) 
ON DELETE RESTRICT;