-- 启用 vehicles 表的 RLS（如果尚未启用）
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- 删除旧的限制性策略（如果存在）
DROP POLICY IF EXISTS "管理员可以更新车辆" ON vehicles;
DROP POLICY IF EXISTS "管理员可以删除车辆" ON vehicles;

-- 创建新的策略：所有认证用户都可以插入、更新、删除车辆
CREATE POLICY "认证用户可以插入车辆"
  ON vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "认证用户可以更新车辆"
  ON vehicles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "认证用户可以删除车辆"
  ON vehicles
  FOR DELETE
  TO authenticated
  USING (true);

-- 保留现有的查看策略
-- "认证用户可以查看所有车辆" 已存在
-- "所有人可以查看在售车辆" 已存在（用于手机端展示）

COMMENT ON TABLE vehicles IS '车辆信息表 - 所有认证用户（员工）都有完整的增删改查权限';