-- 添加车商管理员可以为自己的车行创建会员记录的策略
CREATE POLICY "车商管理员可创建自己车行的会员记录" ON dealership_memberships
  FOR INSERT TO authenticated
  WITH CHECK (
    dealership_id IN (
      SELECT dealership_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 同时修改 initialize_dealership_membership 函数为 SECURITY DEFINER
-- 这样可以绕过RLS策略，确保初始化功能正常工作
CREATE OR REPLACE FUNCTION initialize_dealership_membership(p_dealership_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tier_id UUID;
  v_membership_id UUID;
  v_trial_end_date DATE;
  v_vehicle_count INTEGER;
BEGIN
  -- 检查是否已有会员记录
  SELECT id INTO v_membership_id
  FROM dealership_memberships
  WHERE dealership_id = p_dealership_id
  LIMIT 1;
  
  IF v_membership_id IS NOT NULL THEN
    RETURN v_membership_id;
  END IF;
  
  -- 获取当前车辆数量
  v_vehicle_count := get_dealership_vehicle_count(p_dealership_id);
  
  -- 计算会员等级
  v_tier_id := calculate_membership_tier(v_vehicle_count);
  
  -- 计算免费期结束日期（6个月后）
  v_trial_end_date := CURRENT_DATE + INTERVAL '6 months';
  
  -- 创建会员记录
  INSERT INTO dealership_memberships (
    dealership_id,
    tier_id,
    start_date,
    end_date,
    is_trial,
    trial_end_date,
    status
  ) VALUES (
    p_dealership_id,
    v_tier_id,
    CURRENT_DATE,
    v_trial_end_date,
    TRUE,
    v_trial_end_date,
    'active'
  ) RETURNING id INTO v_membership_id;
  
  RETURN v_membership_id;
END;
$$;