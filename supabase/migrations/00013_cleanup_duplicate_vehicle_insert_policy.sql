-- 删除旧的重复策略
DROP POLICY IF EXISTS "员工可以录入新车辆" ON vehicles;

-- 保留 "认证用户可以插入车辆" 策略（已存在）

-- 添加说明注释
COMMENT ON POLICY "认证用户可以插入车辆" ON vehicles IS '所有认证用户（注册员工）都可以录入新车辆';