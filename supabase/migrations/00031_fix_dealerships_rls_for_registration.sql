-- 删除所有现有的 INSERT 策略
DROP POLICY IF EXISTS "dealerships_insert_policy" ON dealerships;
DROP POLICY IF EXISTS "允许所有人提交车行注册申请" ON dealerships;
DROP POLICY IF EXISTS "允许匿名用户提交车行注册申请" ON dealerships;

-- 创建新的策略：允许匿名用户插入 pending 状态的车行
CREATE POLICY "anon_insert_pending_dealerships"
ON dealerships FOR INSERT
TO anon
WITH CHECK (status = 'pending');

-- 创建新的策略：允许已认证用户插入车行（超级管理员可以插入任何状态，普通用户只能插入 pending）
CREATE POLICY "authenticated_insert_dealerships"
ON dealerships FOR INSERT
TO authenticated
WITH CHECK (is_super_admin() OR status = 'pending');