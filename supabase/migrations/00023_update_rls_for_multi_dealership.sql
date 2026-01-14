-- =====================================================
-- 更新 RLS 策略以支持多车行数据隔离
-- =====================================================

-- 1. dealerships 表的 RLS 策略
ALTER TABLE dealerships ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "dealerships_select_policy" ON dealerships;
DROP POLICY IF EXISTS "dealerships_insert_policy" ON dealerships;
DROP POLICY IF EXISTS "dealerships_update_policy" ON dealerships;
DROP POLICY IF EXISTS "dealerships_delete_policy" ON dealerships;

-- 查看：所有认证用户可以查看自己所属的车行，super_admin 可以查看所有车行
CREATE POLICY "dealerships_select_policy" ON dealerships
  FOR SELECT
  TO authenticated
  USING (
    is_super_admin() OR 
    id = get_user_dealership_id()
  );

-- 插入：只有 super_admin 可以创建新车行
CREATE POLICY "dealerships_insert_policy" ON dealerships
  FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

-- 更新：super_admin 可以更新所有车行，车行管理员可以更新自己的车行
CREATE POLICY "dealerships_update_policy" ON dealerships
  FOR UPDATE
  TO authenticated
  USING (
    is_super_admin() OR 
    (id = get_user_dealership_id() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  );

-- 删除：只有 super_admin 可以删除车行
CREATE POLICY "dealerships_delete_policy" ON dealerships
  FOR DELETE
  TO authenticated
  USING (is_super_admin());

-- 2. 更新 profiles 表的 RLS 策略
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- 查看：用户可以查看同车行的员工，super_admin 可以查看所有
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    is_super_admin() OR 
    dealership_id = get_user_dealership_id()
  );

-- 插入：管理员可以添加本车行员工，super_admin 可以添加任何车行员工
CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_super_admin() OR 
    (dealership_id = get_user_dealership_id() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  );

-- 更新：用户可以更新自己的信息，管理员可以更新本车行员工，super_admin 可以更新所有
CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    is_super_admin() OR 
    id = auth.uid() OR 
    (dealership_id = get_user_dealership_id() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  );

-- 删除：只有管理员可以删除本车行员工，super_admin 可以删除任何员工
CREATE POLICY "profiles_delete_policy" ON profiles
  FOR DELETE
  TO authenticated
  USING (
    is_super_admin() OR 
    (dealership_id = get_user_dealership_id() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  );

-- 3. 更新 employees 表的 RLS 策略
DROP POLICY IF EXISTS "employees_select_policy" ON employees;
DROP POLICY IF EXISTS "employees_insert_policy" ON employees;
DROP POLICY IF EXISTS "employees_update_policy" ON employees;
DROP POLICY IF EXISTS "employees_delete_policy" ON employees;

CREATE POLICY "employees_select_policy" ON employees
  FOR SELECT TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "employees_insert_policy" ON employees
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "employees_update_policy" ON employees
  FOR UPDATE TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "employees_delete_policy" ON employees
  FOR DELETE TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

-- 4. 更新 vehicles 表的 RLS 策略
DROP POLICY IF EXISTS "vehicles_select_policy" ON vehicles;
DROP POLICY IF EXISTS "vehicles_insert_policy" ON vehicles;
DROP POLICY IF EXISTS "vehicles_update_policy" ON vehicles;
DROP POLICY IF EXISTS "vehicles_delete_policy" ON vehicles;

CREATE POLICY "vehicles_select_policy" ON vehicles
  FOR SELECT TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "vehicles_insert_policy" ON vehicles
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "vehicles_update_policy" ON vehicles
  FOR UPDATE TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "vehicles_delete_policy" ON vehicles
  FOR DELETE TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

-- 5. 更新 vehicle_sales 表的 RLS 策略
DROP POLICY IF EXISTS "vehicle_sales_select_policy" ON vehicle_sales;
DROP POLICY IF EXISTS "vehicle_sales_insert_policy" ON vehicle_sales;
DROP POLICY IF EXISTS "vehicle_sales_update_policy" ON vehicle_sales;
DROP POLICY IF EXISTS "vehicle_sales_delete_policy" ON vehicle_sales;

CREATE POLICY "vehicle_sales_select_policy" ON vehicle_sales
  FOR SELECT TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "vehicle_sales_insert_policy" ON vehicle_sales
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "vehicle_sales_update_policy" ON vehicle_sales
  FOR UPDATE TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "vehicle_sales_delete_policy" ON vehicle_sales
  FOR DELETE TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

-- 6. 更新 vehicle_costs 表的 RLS 策略
DROP POLICY IF EXISTS "vehicle_costs_select_policy" ON vehicle_costs;
DROP POLICY IF EXISTS "vehicle_costs_insert_policy" ON vehicle_costs;
DROP POLICY IF EXISTS "vehicle_costs_update_policy" ON vehicle_costs;
DROP POLICY IF EXISTS "vehicle_costs_delete_policy" ON vehicle_costs;

CREATE POLICY "vehicle_costs_select_policy" ON vehicle_costs
  FOR SELECT TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "vehicle_costs_insert_policy" ON vehicle_costs
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "vehicle_costs_update_policy" ON vehicle_costs
  FOR UPDATE TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "vehicle_costs_delete_policy" ON vehicle_costs
  FOR DELETE TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

-- 7. 更新 expenses 表的 RLS 策略
DROP POLICY IF EXISTS "expenses_select_policy" ON expenses;
DROP POLICY IF EXISTS "expenses_insert_policy" ON expenses;
DROP POLICY IF EXISTS "expenses_update_policy" ON expenses;
DROP POLICY IF EXISTS "expenses_delete_policy" ON expenses;

CREATE POLICY "expenses_select_policy" ON expenses
  FOR SELECT TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "expenses_insert_policy" ON expenses
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "expenses_update_policy" ON expenses
  FOR UPDATE TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "expenses_delete_policy" ON expenses
  FOR DELETE TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

-- 8. 更新 profit_distributions 表的 RLS 策略
DROP POLICY IF EXISTS "profit_distributions_select_policy" ON profit_distributions;
DROP POLICY IF EXISTS "profit_distributions_insert_policy" ON profit_distributions;
DROP POLICY IF EXISTS "profit_distributions_update_policy" ON profit_distributions;
DROP POLICY IF EXISTS "profit_distributions_delete_policy" ON profit_distributions;

CREATE POLICY "profit_distributions_select_policy" ON profit_distributions
  FOR SELECT TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "profit_distributions_insert_policy" ON profit_distributions
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "profit_distributions_update_policy" ON profit_distributions
  FOR UPDATE TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "profit_distributions_delete_policy" ON profit_distributions
  FOR DELETE TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

-- 9. 更新 profit_rules 表的 RLS 策略
DROP POLICY IF EXISTS "profit_rules_select_policy" ON profit_rules;
DROP POLICY IF EXISTS "profit_rules_insert_policy" ON profit_rules;
DROP POLICY IF EXISTS "profit_rules_update_policy" ON profit_rules;
DROP POLICY IF EXISTS "profit_rules_delete_policy" ON profit_rules;

CREATE POLICY "profit_rules_select_policy" ON profit_rules
  FOR SELECT TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "profit_rules_insert_policy" ON profit_rules
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "profit_rules_update_policy" ON profit_rules
  FOR UPDATE TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "profit_rules_delete_policy" ON profit_rules
  FOR DELETE TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

-- 10. 更新 monthly_bonuses 表的 RLS 策略
DROP POLICY IF EXISTS "monthly_bonuses_select_policy" ON monthly_bonuses;
DROP POLICY IF EXISTS "monthly_bonuses_insert_policy" ON monthly_bonuses;
DROP POLICY IF EXISTS "monthly_bonuses_update_policy" ON monthly_bonuses;
DROP POLICY IF EXISTS "monthly_bonuses_delete_policy" ON monthly_bonuses;

CREATE POLICY "monthly_bonuses_select_policy" ON monthly_bonuses
  FOR SELECT TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "monthly_bonuses_insert_policy" ON monthly_bonuses
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "monthly_bonuses_update_policy" ON monthly_bonuses
  FOR UPDATE TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());

CREATE POLICY "monthly_bonuses_delete_policy" ON monthly_bonuses
  FOR DELETE TO authenticated
  USING (is_super_admin() OR dealership_id = get_user_dealership_id());