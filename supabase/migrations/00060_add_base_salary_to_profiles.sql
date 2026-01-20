
-- 添加底薪字段到 profiles 表
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS has_base_salary BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS base_salary NUMERIC(10, 2) DEFAULT 0;

-- 添加注释
COMMENT ON COLUMN profiles.has_base_salary IS '是否有底薪';
COMMENT ON COLUMN profiles.base_salary IS '底薪金额（元）';
