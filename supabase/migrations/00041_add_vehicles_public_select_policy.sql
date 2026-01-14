
-- 添加允许匿名用户查看在售车辆的 RLS 策略
CREATE POLICY "vehicles_public_select_policy"
ON vehicles
FOR SELECT
TO anon
USING (status = 'in_stock');

-- 添加注释
COMMENT ON POLICY "vehicles_public_select_policy" ON vehicles IS '允许匿名用户查看在售车辆';
