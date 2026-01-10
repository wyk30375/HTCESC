-- 创建用户角色枚举
CREATE TYPE user_role AS ENUM ('admin', 'employee');

-- 创建员工角色类型枚举
CREATE TYPE employee_role_type AS ENUM ('landlord', 'bonus_pool', 'sales_commission', 'investor');

-- 创建车辆状态枚举
CREATE TYPE vehicle_status AS ENUM ('in_stock', 'sold');

-- 创建用户资料表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'employee'::user_role,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建员工信息表
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  contact TEXT NOT NULL,
  hire_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建员工角色关联表
CREATE TABLE employee_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  role_type employee_role_type NOT NULL,
  share_percentage DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, role_type)
);

-- 创建车辆信息表
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vin_last_six TEXT UNIQUE NOT NULL,
  plate_number TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  condition_description TEXT,
  photos TEXT[] DEFAULT '{}',
  status vehicle_status NOT NULL DEFAULT 'in_stock'::vehicle_status,
  purchase_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建车辆成本明细表
CREATE TABLE vehicle_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  cost_type TEXT NOT NULL CHECK (cost_type IN ('purchase', 'preparation', 'transfer', 'misc')),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建车辆销售记录表
CREATE TABLE vehicle_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  sale_date DATE NOT NULL,
  sale_price DECIMAL(12,2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_contact TEXT NOT NULL,
  has_loan BOOLEAN DEFAULT false,
  loan_rebate DECIMAL(12,2) DEFAULT 0,
  sale_preparation_cost DECIMAL(12,2) DEFAULT 0,
  sale_transfer_cost DECIMAL(12,2) DEFAULT 0,
  sale_misc_cost DECIMAL(12,2) DEFAULT 0,
  total_profit DECIMAL(12,2) NOT NULL,
  sales_employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建费用记录表
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE NOT NULL,
  expense_type TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建利润分配记录表
CREATE TABLE profit_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES vehicle_sales(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  role_type employee_role_type NOT NULL,
  distribution_amount DECIMAL(12,2) NOT NULL,
  distribution_percentage DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建月度奖金池表
CREATE TABLE monthly_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  total_bonus_pool DECIMAL(12,2) NOT NULL DEFAULT 0,
  distributed_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  remaining_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  champion_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  champion_bonus DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, month)
);

-- 创建索引
CREATE INDEX idx_employees_profile_id ON employees(profile_id);
CREATE INDEX idx_employee_roles_employee_id ON employee_roles(employee_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicle_costs_vehicle_id ON vehicle_costs(vehicle_id);
CREATE INDEX idx_vehicle_sales_vehicle_id ON vehicle_sales(vehicle_id);
CREATE INDEX idx_vehicle_sales_employee_id ON vehicle_sales(sales_employee_id);
CREATE INDEX idx_vehicle_sales_date ON vehicle_sales(sale_date);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_profit_distributions_sale_id ON profit_distributions(sale_id);
CREATE INDEX idx_profit_distributions_employee_id ON profit_distributions(employee_id);
CREATE INDEX idx_monthly_bonuses_year_month ON monthly_bonuses(year, month);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为相关表添加更新时间触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_bonuses_updated_at BEFORE UPDATE ON monthly_bonuses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建用户同步触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  INSERT INTO public.profiles (id, username, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    NEW.phone,
    CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'employee'::user_role END
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- 创建管理员检查函数
CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- 创建公开资料视图
CREATE VIEW public_profiles AS
  SELECT id, username, role FROM profiles;

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_bonuses ENABLE ROW LEVEL SECURITY;

-- Profiles 策略
CREATE POLICY "管理员可以查看所有资料" ON profiles
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "用户可以查看自己的资料" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的资料" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "管理员可以更新所有资料" ON profiles
  FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

-- Employees 策略
CREATE POLICY "认证用户可以查看员工信息" ON employees
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "管理员可以管理员工信息" ON employees
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Employee Roles 策略
CREATE POLICY "认证用户可以查看员工角色" ON employee_roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "管理员可以管理员工角色" ON employee_roles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Vehicles 策略
CREATE POLICY "所有人可以查看在售车辆" ON vehicles
  FOR SELECT USING (status = 'in_stock'::vehicle_status);

CREATE POLICY "认证用户可以查看所有车辆" ON vehicles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "管理员可以管理车辆" ON vehicles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Vehicle Costs 策略
CREATE POLICY "认证用户可以查看车辆成本" ON vehicle_costs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "管理员可以管理车辆成本" ON vehicle_costs
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Vehicle Sales 策略
CREATE POLICY "认证用户可以查看销售记录" ON vehicle_sales
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "管理员可以管理销售记录" ON vehicle_sales
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Expenses 策略
CREATE POLICY "认证用户可以查看费用记录" ON expenses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "管理员可以管理费用记录" ON expenses
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Profit Distributions 策略
CREATE POLICY "认证用户可以查看利润分配" ON profit_distributions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "管理员可以管理利润分配" ON profit_distributions
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Monthly Bonuses 策略
CREATE POLICY "认证用户可以查看月度奖金" ON monthly_bonuses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "管理员可以管理月度奖金" ON monthly_bonuses
  FOR ALL TO authenticated USING (is_admin(auth.uid()));