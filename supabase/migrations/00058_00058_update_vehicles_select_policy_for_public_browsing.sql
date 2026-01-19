-- 修改vehicles表的SELECT策略，允许已认证用户浏览所有在售车辆
-- 这样用户在登录状态下访问车辆列表页面时，也能看到所有车行的在售车辆

-- 删除旧的SELECT策略
DROP POLICY IF EXISTS vehicles_select_policy ON vehicles;

-- 创建新的SELECT策略
-- 规则：
-- 1. 超级管理员可以看到所有车辆（包括所有状态）
-- 2. 普通用户可以看到自己车行的所有车辆（包括所有状态）
-- 3. 所有已认证用户可以看到所有在售车辆（用于公开浏览）
CREATE POLICY vehicles_select_policy ON vehicles
FOR SELECT
TO authenticated
USING (
  is_super_admin() 
  OR dealership_id = get_user_dealership_id()
  OR status = 'in_stock'
);

-- 说明：
-- 这个策略确保了：
-- - 车行员工可以管理自己车行的所有车辆（在车辆管理页面）
-- - 所有用户（包括已登录用户）可以浏览所有在售车辆（在车辆列表页面）
-- - 匿名用户通过 vehicles_public_select_policy 也可以浏览所有在售车辆