
-- 修复 vehicles 表的 RLS 策略

-- 删除错误的策略
DROP POLICY IF EXISTS "认证用户可以删除车辆" ON vehicles;
DROP POLICY IF EXISTS "认证用户可以插入车辆" ON vehicles;
DROP POLICY IF EXISTS "认证用户可以更新车辆" ON vehicles;
DROP POLICY IF EXISTS "所有人可以查看在售车辆" ON vehicles;

-- 保留正确的策略（基于 dealership_id 过滤）
-- vehicles_select_policy: 超级管理员或同车行用户可以查看
-- vehicles_insert_policy: 超级管理员或同车行用户可以创建
-- vehicles_update_policy: 超级管理员或同车行用户可以更新
-- vehicles_delete_policy: 超级管理员或同车行用户可以删除

-- 返回修复结果
SELECT 'Vehicles RLS policies fixed successfully' AS status;
