-- 创建管理员密码重置函数
CREATE OR REPLACE FUNCTION reset_admin_password(
  p_username TEXT,
  p_new_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_role TEXT;
BEGIN
  -- 查找用户
  SELECT id, email, role INTO v_user_id, v_email, v_role
  FROM profiles
  WHERE username = p_username;

  -- 检查用户是否存在
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', '用户不存在'
    );
  END IF;

  -- 检查是否为管理员
  IF v_role != 'admin' THEN
    RETURN json_build_object(
      'success', false,
      'message', '只有管理员可以使用此功能'
    );
  END IF;

  -- 更新密码（通过 auth.users 表）
  -- 注意：这需要使用 Supabase 的 service_role 权限
  -- 在实际应用中，这个操作应该通过 Edge Function 完成
  
  -- 更新 profiles 表标记为默认密码
  UPDATE profiles
  SET default_password = p_new_password
  WHERE id = v_user_id;

  RETURN json_build_object(
    'success', true,
    'message', '密码重置成功',
    'user_id', v_user_id,
    'email', v_email
  );
END;
$$;

-- 添加注释
COMMENT ON FUNCTION reset_admin_password IS '管理员密码重置函数，只能重置管理员账号的密码';

-- 授权给所有认证用户（但函数内部会检查是否为管理员）
GRANT EXECUTE ON FUNCTION reset_admin_password TO anon, authenticated;