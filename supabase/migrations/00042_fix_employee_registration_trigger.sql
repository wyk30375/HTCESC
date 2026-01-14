
-- 修复员工注册问题：确保在用户创建时立即创建 profile
-- 同时保留邮箱确认后的触发器（用于生产环境）

-- 1. 修改触发器，改为在 INSERT 时触发（而不是等待邮箱确认）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 2. 添加一个 UPDATE 策略，允许用户在首次注册时设置 dealership_id
-- 这个策略允许用户更新自己的 dealership_id（从 null 到非 null）
DROP POLICY IF EXISTS profiles_first_time_dealership_update ON profiles;
CREATE POLICY profiles_first_time_dealership_update ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() AND dealership_id IS NULL
  )
  WITH CHECK (
    id = auth.uid()
  );

-- 3. 确保现有的 UPDATE 策略不会冲突
-- 保留原有的 profiles_update_policy，它允许：
-- - 超级管理员更新任何用户
-- - 用户更新自己
-- - 车行管理员更新同车行的员工
