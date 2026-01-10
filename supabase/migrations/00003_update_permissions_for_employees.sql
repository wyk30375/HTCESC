-- 删除旧的车辆相关策略
DROP POLICY IF EXISTS "所有人可以查看在售车辆" ON vehicles;
DROP POLICY IF EXISTS "认证用户可以查看所有车辆" ON vehicles;
DROP POLICY IF EXISTS "管理员可以管理车辆" ON vehicles;

DROP POLICY IF EXISTS "认证用户可以查看车辆成本" ON vehicle_costs;
DROP POLICY IF EXISTS "管理员可以管理车辆成本" ON vehicle_costs;

DROP POLICY IF EXISTS "认证用户可以查看销售记录" ON vehicle_sales;
DROP POLICY IF EXISTS "管理员可以管理销售记录" ON vehicle_sales;

DROP POLICY IF EXISTS "认证用户可以查看费用记录" ON expenses;
DROP POLICY IF EXISTS "管理员可以管理费用记录" ON expenses;

DROP POLICY IF EXISTS "认证用户可以查看员工信息" ON employees;
DROP POLICY IF EXISTS "管理员可以管理员工信息" ON employees;

DROP POLICY IF EXISTS "认证用户可以查看员工角色" ON employee_roles;
DROP POLICY IF EXISTS "管理员可以管理员工角色" ON employee_roles;

DROP POLICY IF EXISTS "认证用户可以查看利润分配" ON profit_distributions;
DROP POLICY IF EXISTS "管理员可以管理利润分配" ON profit_distributions;

DROP POLICY IF EXISTS "认证用户可以查看月度奖金" ON monthly_bonuses;
DROP POLICY IF EXISTS "管理员可以管理月度奖金" ON monthly_bonuses;

-- 车辆表新策略
-- 所有人可以查看在售车辆（用于客户展示）
CREATE POLICY "所有人可以查看在售车辆" ON vehicles
  FOR SELECT USING (status = 'in_stock'::vehicle_status);

-- 认证用户可以查看所有车辆
CREATE POLICY "认证用户可以查看所有车辆" ON vehicles
  FOR SELECT TO authenticated USING (true);

-- 员工可以插入新车辆
CREATE POLICY "员工可以录入新车辆" ON vehicles
  FOR INSERT TO authenticated 
  WITH CHECK (true);

-- 只有管理员可以更新和删除车辆
CREATE POLICY "管理员可以更新车辆" ON vehicles
  FOR UPDATE TO authenticated 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "管理员可以删除车辆" ON vehicles
  FOR DELETE TO authenticated 
  USING (is_admin(auth.uid()));

-- 车辆成本表新策略
CREATE POLICY "认证用户可以查看车辆成本" ON vehicle_costs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "员工可以添加车辆成本" ON vehicle_costs
  FOR INSERT TO authenticated 
  WITH CHECK (true);

CREATE POLICY "管理员可以更新车辆成本" ON vehicle_costs
  FOR UPDATE TO authenticated 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "管理员可以删除车辆成本" ON vehicle_costs
  FOR DELETE TO authenticated 
  USING (is_admin(auth.uid()));

-- 销售记录表新策略
CREATE POLICY "认证用户可以查看销售记录" ON vehicle_sales
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "员工可以创建销售记录" ON vehicle_sales
  FOR INSERT TO authenticated 
  WITH CHECK (true);

CREATE POLICY "管理员可以更新销售记录" ON vehicle_sales
  FOR UPDATE TO authenticated 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "管理员可以删除销售记录" ON vehicle_sales
  FOR DELETE TO authenticated 
  USING (is_admin(auth.uid()));

-- 费用记录表新策略
CREATE POLICY "认证用户可以查看费用记录" ON expenses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "员工可以创建费用记录" ON expenses
  FOR INSERT TO authenticated 
  WITH CHECK (true);

CREATE POLICY "管理员可以更新费用记录" ON expenses
  FOR UPDATE TO authenticated 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "管理员可以删除费用记录" ON expenses
  FOR DELETE TO authenticated 
  USING (is_admin(auth.uid()));

-- 员工表新策略
CREATE POLICY "认证用户可以查看员工信息" ON employees
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "管理员可以管理员工信息" ON employees
  FOR ALL TO authenticated 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 员工角色表新策略
CREATE POLICY "认证用户可以查看员工角色" ON employee_roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "管理员可以管理员工角色" ON employee_roles
  FOR ALL TO authenticated 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 利润分配表新策略
CREATE POLICY "认证用户可以查看利润分配" ON profit_distributions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "管理员可以管理利润分配" ON profit_distributions
  FOR ALL TO authenticated 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 月度奖金表新策略
CREATE POLICY "认证用户可以查看月度奖金" ON monthly_bonuses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "管理员可以管理月度奖金" ON monthly_bonuses
  FOR ALL TO authenticated 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 存储桶策略更新
DROP POLICY IF EXISTS "管理员可以上传车辆图片" ON storage.objects;
DROP POLICY IF EXISTS "管理员可以更新车辆图片" ON storage.objects;
DROP POLICY IF EXISTS "管理员可以删除车辆图片" ON storage.objects;

-- 员工可以上传图片
CREATE POLICY "员工可以上传车辆图片" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'app_8u0242wc45c1_vehicle_images');

-- 只有管理员可以更新和删除图片
CREATE POLICY "管理员可以更新车辆图片" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'app_8u0242wc45c1_vehicle_images' AND
    is_admin(auth.uid())
  );

CREATE POLICY "管理员可以删除车辆图片" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'app_8u0242wc45c1_vehicle_images' AND
    is_admin(auth.uid())
  );