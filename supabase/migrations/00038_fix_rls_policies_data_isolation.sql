
-- 修复 RLS 策略，确保多租户数据隔离

-- ============================================
-- 1. 修复 profiles 表的 RLS 策略
-- ============================================

-- 删除有问题的策略
DROP POLICY IF EXISTS "认证用户可以查看所有资料" ON profiles;
DROP POLICY IF EXISTS "管理员可以查看所有资料" ON profiles;
DROP POLICY IF EXISTS "管理员可以更新所有资料" ON profiles;
DROP POLICY IF EXISTS "用户可以查看自己的资料" ON profiles;
DROP POLICY IF EXISTS "用户可以更新自己的资料" ON profiles;

-- 保留正确的策略（基于 dealership_id 过滤）
-- profiles_select_policy: 超级管理员或同车行用户可以查看
-- profiles_insert_policy: 超级管理员或同车行管理员可以创建
-- profiles_update_policy: 超级管理员、本人或同车行管理员可以更新
-- profiles_delete_policy: 超级管理员或同车行管理员可以删除

-- ============================================
-- 2. 修复 vehicle_sales 表的 RLS 策略
-- ============================================

-- 删除有问题的策略
DROP POLICY IF EXISTS "认证用户可以查看销售记录" ON vehicle_sales;
DROP POLICY IF EXISTS "认证用户可以更新销售记录" ON vehicle_sales;
DROP POLICY IF EXISTS "认证用户可以删除销售记录" ON vehicle_sales;
DROP POLICY IF EXISTS "员工可以创建销售记录" ON vehicle_sales;

-- 保留正确的策略（基于 dealership_id 过滤）
-- vehicle_sales_select_policy: 超级管理员或同车行用户可以查看
-- vehicle_sales_insert_policy: 需要添加 with_check
-- vehicle_sales_update_policy: 超级管理员或同车行用户可以更新
-- vehicle_sales_delete_policy: 超级管理员或同车行用户可以删除

-- 更新 INSERT 策略，添加 with_check 确保插入的数据属于当前车行
DROP POLICY IF EXISTS "vehicle_sales_insert_policy" ON vehicle_sales;
CREATE POLICY "vehicle_sales_insert_policy" ON vehicle_sales
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_super_admin() OR 
    dealership_id = get_user_dealership_id()
  );

-- ============================================
-- 3. 检查 vehicles 表的 RLS 策略
-- ============================================

-- 删除可能存在的有问题的策略
DROP POLICY IF EXISTS "认证用户可以查看所有车辆" ON vehicles;
DROP POLICY IF EXISTS "认证用户可以更新所有车辆" ON vehicles;
DROP POLICY IF EXISTS "认证用户可以删除所有车辆" ON vehicles;

-- 确保 vehicles 表的策略正确（基于 dealership_id 过滤）
-- 如果不存在，创建正确的策略
DO $$
BEGIN
  -- SELECT 策略
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vehicles' 
    AND policyname = 'vehicles_select_policy'
  ) THEN
    CREATE POLICY "vehicles_select_policy" ON vehicles
      FOR SELECT
      TO authenticated
      USING (
        is_super_admin() OR 
        dealership_id = get_user_dealership_id()
      );
  END IF;

  -- INSERT 策略
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vehicles' 
    AND policyname = 'vehicles_insert_policy'
  ) THEN
    CREATE POLICY "vehicles_insert_policy" ON vehicles
      FOR INSERT
      TO authenticated
      WITH CHECK (
        is_super_admin() OR 
        dealership_id = get_user_dealership_id()
      );
  END IF;

  -- UPDATE 策略
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vehicles' 
    AND policyname = 'vehicles_update_policy'
  ) THEN
    CREATE POLICY "vehicles_update_policy" ON vehicles
      FOR UPDATE
      TO authenticated
      USING (
        is_super_admin() OR 
        dealership_id = get_user_dealership_id()
      );
  END IF;

  -- DELETE 策略
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vehicles' 
    AND policyname = 'vehicles_delete_policy'
  ) THEN
    CREATE POLICY "vehicles_delete_policy" ON vehicles
      FOR DELETE
      TO authenticated
      USING (
        is_super_admin() OR 
        dealership_id = get_user_dealership_id()
      );
  END IF;
END $$;

-- ============================================
-- 4. 检查 employees 表的 RLS 策略
-- ============================================

DROP POLICY IF EXISTS "认证用户可以查看所有员工" ON employees;
DROP POLICY IF EXISTS "认证用户可以更新所有员工" ON employees;
DROP POLICY IF EXISTS "认证用户可以删除所有员工" ON employees;

-- ============================================
-- 5. 检查 expenses 表的 RLS 策略
-- ============================================

DROP POLICY IF EXISTS "认证用户可以查看所有费用" ON expenses;
DROP POLICY IF EXISTS "认证用户可以更新所有费用" ON expenses;
DROP POLICY IF EXISTS "认证用户可以删除所有费用" ON expenses;

-- ============================================
-- 6. 验证所有表的 RLS 都已启用
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_distributions ENABLE ROW LEVEL SECURITY;

-- 返回修复结果
SELECT 'RLS policies fixed successfully' AS status;
