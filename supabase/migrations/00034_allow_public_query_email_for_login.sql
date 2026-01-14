-- 允许所有人（包括匿名用户）根据用户名查询邮箱地址（仅用于登录）
CREATE POLICY "allow_public_query_email_for_login"
ON profiles FOR SELECT
TO anon, authenticated
USING (true);