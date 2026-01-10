-- 在 profiles 表添加 phone 字段
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 添加注释
COMMENT ON COLUMN profiles.phone IS '手机号码';