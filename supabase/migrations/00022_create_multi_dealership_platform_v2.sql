-- =====================================================
-- 多车行平台架构改造
-- =====================================================

-- 1. 创建车行表
CREATE TABLE IF NOT EXISTS dealerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  contact_person TEXT,
  contact_phone TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_dealerships_code ON dealerships(code);
CREATE INDEX IF NOT EXISTS idx_dealerships_status ON dealerships(status);

-- 添加注释
COMMENT ON TABLE dealerships IS '车行表 - 存储所有注册的车行信息';
COMMENT ON COLUMN dealerships.name IS '车行名称';
COMMENT ON COLUMN dealerships.code IS '车行代码（唯一标识）';
COMMENT ON COLUMN dealerships.status IS '状态：active-正常, inactive-停用';

-- 2. 创建默认车行（用于迁移现有数据）
INSERT INTO dealerships (id, name, code, contact_person, contact_phone, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '易驰汽车',
  'yichi',
  '吴韩',
  '18288950738',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- 3. 为 profiles 表添加 dealership_id
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE;
UPDATE profiles SET dealership_id = '00000000-0000-0000-0000-000000000001' WHERE dealership_id IS NULL;
ALTER TABLE profiles ALTER COLUMN dealership_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_dealership_id ON profiles(dealership_id);

-- 更新角色枚举，添加 super_admin
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'super_admin'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'super_admin';
  END IF;
END $$;

-- 4. 为 employees 表添加 dealership_id
ALTER TABLE employees ADD COLUMN IF NOT EXISTS dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE;
UPDATE employees SET dealership_id = '00000000-0000-0000-0000-000000000001' WHERE dealership_id IS NULL;
ALTER TABLE employees ALTER COLUMN dealership_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_dealership_id ON employees(dealership_id);

-- 5. 为 vehicles 表添加 dealership_id
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE;
UPDATE vehicles SET dealership_id = '00000000-0000-0000-0000-000000000001' WHERE dealership_id IS NULL;
ALTER TABLE vehicles ALTER COLUMN dealership_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_dealership_id ON vehicles(dealership_id);

-- 6. 为 vehicle_sales 表添加 dealership_id
ALTER TABLE vehicle_sales ADD COLUMN IF NOT EXISTS dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE;
UPDATE vehicle_sales SET dealership_id = '00000000-0000-0000-0000-000000000001' WHERE dealership_id IS NULL;
ALTER TABLE vehicle_sales ALTER COLUMN dealership_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_dealership_id ON vehicle_sales(dealership_id);

-- 7. 为 vehicle_costs 表添加 dealership_id
ALTER TABLE vehicle_costs ADD COLUMN IF NOT EXISTS dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE;
UPDATE vehicle_costs SET dealership_id = '00000000-0000-0000-0000-000000000001' WHERE dealership_id IS NULL;
ALTER TABLE vehicle_costs ALTER COLUMN dealership_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehicle_costs_dealership_id ON vehicle_costs(dealership_id);

-- 8. 为 expenses 表添加 dealership_id
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE;
UPDATE expenses SET dealership_id = '00000000-0000-0000-0000-000000000001' WHERE dealership_id IS NULL;
ALTER TABLE expenses ALTER COLUMN dealership_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_dealership_id ON expenses(dealership_id);

-- 9. 为 profit_distributions 表添加 dealership_id
ALTER TABLE profit_distributions ADD COLUMN IF NOT EXISTS dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE;
UPDATE profit_distributions SET dealership_id = '00000000-0000-0000-0000-000000000001' WHERE dealership_id IS NULL;
ALTER TABLE profit_distributions ALTER COLUMN dealership_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profit_distributions_dealership_id ON profit_distributions(dealership_id);

-- 10. 为 profit_rules 表添加 dealership_id
ALTER TABLE profit_rules ADD COLUMN IF NOT EXISTS dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE;
UPDATE profit_rules SET dealership_id = '00000000-0000-0000-0000-000000000001' WHERE dealership_id IS NULL;
ALTER TABLE profit_rules ALTER COLUMN dealership_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profit_rules_dealership_id ON profit_rules(dealership_id);

-- 11. 为 monthly_bonuses 表添加 dealership_id
ALTER TABLE monthly_bonuses ADD COLUMN IF NOT EXISTS dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE;
UPDATE monthly_bonuses SET dealership_id = '00000000-0000-0000-0000-000000000001' WHERE dealership_id IS NULL;
ALTER TABLE monthly_bonuses ALTER COLUMN dealership_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_monthly_bonuses_dealership_id ON monthly_bonuses(dealership_id);

-- 12. 创建获取用户车行信息的函数
CREATE OR REPLACE FUNCTION get_user_dealership_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_dealership_id UUID;
BEGIN
  SELECT dealership_id INTO user_dealership_id
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN user_dealership_id;
END;
$$;

-- 13. 创建检查用户是否为超级管理员的函数
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN user_role = 'super_admin';
END;
$$;

COMMENT ON FUNCTION get_user_dealership_id() IS '获取当前用户所属的车行ID';
COMMENT ON FUNCTION is_super_admin() IS '检查当前用户是否为超级管理员';