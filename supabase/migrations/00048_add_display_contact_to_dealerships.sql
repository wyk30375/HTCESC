-- 在dealerships表中添加公共展示联系人信息字段
ALTER TABLE dealerships 
ADD COLUMN IF NOT EXISTS display_contact_name TEXT,
ADD COLUMN IF NOT EXISTS display_contact_phone TEXT;

-- 添加注释
COMMENT ON COLUMN dealerships.display_contact_name IS '公共展示页面的联系人名称（不设置则使用管理员名称）';
COMMENT ON COLUMN dealerships.display_contact_phone IS '公共展示页面的联系电话（不设置则使用管理员电话）';