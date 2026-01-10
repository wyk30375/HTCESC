-- 添加策略：允许所有认证用户查看所有用户资料（用于销售员选择等功能）
DROP POLICY IF EXISTS "认证用户可以查看所有资料" ON profiles;

CREATE POLICY "认证用户可以查看所有资料"
ON profiles
FOR SELECT
TO authenticated
USING (true);

-- 注释：这个策略允许所有认证用户查看所有用户资料
-- 这是必需的，因为：
-- 1. 销售记录需要选择销售员（需要看到所有用户）
-- 2. 利润分配需要选择员工角色（需要看到所有用户）
-- 3. 费用记录需要选择记录人（需要看到所有用户）
-- 用户的敏感信息（如密码）存储在 auth.users 表中，不在 profiles 表
-- profiles 表只包含公开信息（用户名、邮箱、角色等）