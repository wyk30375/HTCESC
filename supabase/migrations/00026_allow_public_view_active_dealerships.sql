-- 允许所有人（包括匿名用户）查看状态为 active 的车行列表
-- 这是为了支持注册时选择车行的功能
CREATE POLICY "允许所有人查看活跃车行列表"
ON dealerships FOR SELECT
TO public
USING (status = 'active');