-- 更新 vehicle_sales 表的权限
-- 删除旧的限制性策略
DROP POLICY IF EXISTS "管理员可以更新销售记录" ON vehicle_sales;
DROP POLICY IF EXISTS "管理员可以删除销售记录" ON vehicle_sales;

-- 创建新的策略：所有认证用户都可以更新和删除销售记录
CREATE POLICY "认证用户可以更新销售记录"
  ON vehicle_sales
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "认证用户可以删除销售记录"
  ON vehicle_sales
  FOR DELETE
  TO authenticated
  USING (true);

-- 更新 vehicle_costs 表的权限
-- 删除旧的限制性策略
DROP POLICY IF EXISTS "管理员可以更新车辆成本" ON vehicle_costs;
DROP POLICY IF EXISTS "管理员可以删除车辆成本" ON vehicle_costs;

-- 创建新的策略：所有认证用户都可以更新和删除车辆成本
CREATE POLICY "认证用户可以更新车辆成本"
  ON vehicle_costs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "认证用户可以删除车辆成本"
  ON vehicle_costs
  FOR DELETE
  TO authenticated
  USING (true);

-- 添加注释
COMMENT ON TABLE vehicle_sales IS '销售记录表 - 所有认证用户（员工）都有完整的增删改查权限';
COMMENT ON TABLE vehicle_costs IS '车辆成本表 - 所有认证用户（员工）都有完整的增删改查权限';