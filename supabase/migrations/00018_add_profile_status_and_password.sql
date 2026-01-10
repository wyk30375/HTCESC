-- 添加员工状态和默认密码字段
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
ADD COLUMN IF NOT EXISTS default_password TEXT;

-- 更新现有记录的状态为 active
UPDATE profiles SET status = 'active' WHERE status IS NULL;

-- 添加注释
COMMENT ON COLUMN profiles.status IS '员工状态：active-在职，inactive-离职';
COMMENT ON COLUMN profiles.default_password IS '默认密码标记，用于显示是否使用默认密码';