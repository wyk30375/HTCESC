-- 允许所有人（包括匿名用户）创建状态为 pending 的车行记录
-- 这是为了支持车行注册申请功能
CREATE POLICY "允许所有人提交车行注册申请"
ON dealerships FOR INSERT
TO public
WITH CHECK (status = 'pending');