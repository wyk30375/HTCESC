-- 暂时禁用 vehicles 表的 RLS 以测试问题
-- 这是临时的，用于诊断问题

ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;

-- 添加注释说明这是临时的
COMMENT ON TABLE vehicles IS '临时禁用 RLS 用于诊断车辆选择问题';