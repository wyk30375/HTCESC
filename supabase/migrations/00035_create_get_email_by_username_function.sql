-- 删除之前的策略
DROP POLICY IF EXISTS "allow_public_query_email_for_login" ON profiles;

-- 创建一个函数来根据用户名获取邮箱地址（仅用于登录）
CREATE OR REPLACE FUNCTION get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_email TEXT;
BEGIN
    SELECT email INTO v_email
    FROM profiles
    WHERE username = p_username
    LIMIT 1;
    
    RETURN v_email;
END;
$$;

-- 授予所有人（包括匿名用户）执行此函数的权限
GRANT EXECUTE ON FUNCTION get_email_by_username TO anon, authenticated;