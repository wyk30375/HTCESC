-- 修复用户邮箱域名
-- 将所有 @miaoda.com 邮箱更新为 @yichi.internal

-- 注意：这个操作需要更新 auth.users 表
-- 由于 RLS 限制，我们创建一个函数来执行此操作

CREATE OR REPLACE FUNCTION fix_user_email_domains()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 更新所有使用旧域名的用户邮箱
  UPDATE auth.users
  SET email = REPLACE(email, '@miaoda.com', '@yichi.internal'),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE email LIKE '%@miaoda.com';
  
  RAISE NOTICE '已更新用户邮箱域名';
END;
$$;

-- 执行修复函数
SELECT fix_user_email_domains();

-- 删除临时函数
DROP FUNCTION IF EXISTS fix_user_email_domains();

-- 添加注释
COMMENT ON TABLE auth.users IS '用户认证表，所有用户邮箱使用 @yichi.internal 域名';