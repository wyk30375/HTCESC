-- 删除旧的超级管理员插入策略（会重新创建一个更简单的版本）
DROP POLICY IF EXISTS "dealerships_insert_policy" ON dealerships;

-- 重新创建：允许已认证的超级管理员插入任何状态的车行
CREATE POLICY "dealerships_insert_policy"
ON dealerships FOR INSERT
TO authenticated
WITH CHECK (is_super_admin() OR status = 'pending');

-- 确保匿名用户策略存在
DROP POLICY IF EXISTS "允许所有人提交车行注册申请" ON dealerships;

CREATE POLICY "允许匿名用户提交车行注册申请"
ON dealerships FOR INSERT
TO anon
WITH CHECK (status = 'pending');