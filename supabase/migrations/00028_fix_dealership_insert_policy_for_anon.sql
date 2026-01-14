-- 删除旧策略
DROP POLICY IF EXISTS "允许所有人提交车行注册申请" ON dealerships;

-- 创建新策略：允许匿名用户和已认证用户创建 pending 状态的车行
CREATE POLICY "允许所有人提交车行注册申请"
ON dealerships FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');