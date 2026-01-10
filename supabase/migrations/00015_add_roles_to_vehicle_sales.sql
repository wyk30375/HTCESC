-- 在 vehicle_sales 表添加角色字段
ALTER TABLE vehicle_sales 
ADD COLUMN IF NOT EXISTS salesperson_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS investor_ids JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS rent_investor_ids JSONB DEFAULT '[]'::jsonb;

-- 添加注释
COMMENT ON COLUMN vehicle_sales.salesperson_id IS '销售员ID';
COMMENT ON COLUMN vehicle_sales.investor_ids IS '押车出资人ID列表（JSON数组）';
COMMENT ON COLUMN vehicle_sales.rent_investor_ids IS '地租出资人ID列表（JSON数组）';

-- 删除 employee_roles 表（不再需要固定角色）
DROP TABLE IF EXISTS employee_roles CASCADE;