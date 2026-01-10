// 用户角色枚举
export type UserRole = 'admin' | 'employee';

// 员工角色类型
export type EmployeeRoleType = 'landlord' | 'bonus_pool' | 'sales_commission' | 'investor';

// 车辆状态
export type VehicleStatus = 'in_stock' | 'sold';

// 用户资料
export interface Profile {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// 员工信息
export interface Employee {
  id: string;
  profile_id: string;
  name: string;
  position: string;
  contact: string;
  hire_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

// 员工角色关联
export interface EmployeeRole {
  id: string;
  employee_id: string;
  role_type: EmployeeRoleType;
  share_percentage: number; // 该角色的分配比例（如果多人共享）
  created_at: string;
  employee?: Employee;
}

// 车辆信息
export interface Vehicle {
  id: string;
  vin_last_six: string; // 车架号后六位（唯一标识）
  plate_number: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  condition_description?: string;
  photos: string[]; // 照片URL数组
  status: VehicleStatus;
  purchase_price: number; // 购车款
  created_at: string;
  updated_at: string;
}

// 车辆成本明细
export interface VehicleCost {
  id: string;
  vehicle_id: string;
  cost_type: 'purchase' | 'preparation' | 'transfer' | 'misc'; // 购车款、整备费、过户费、杂费
  amount: number;
  description?: string;
  created_at: string;
  vehicle?: Vehicle;
}

// 车辆销售记录
export interface VehicleSale {
  id: string;
  vehicle_id: string;
  sale_date: string;
  sale_price: number;
  customer_name: string;
  customer_contact: string;
  customer_id_number?: string; // 客户身份证号
  has_loan: boolean; // 是否有贷款
  loan_rebate: number; // 贷款返利
  sale_preparation_cost: number; // 销售整备费
  sale_transfer_cost: number; // 销售过户费
  sale_misc_cost: number; // 销售杂费
  total_cost: number; // 总成本
  total_profit: number; // 总利润
  salesperson_id: string; // 销售员ID
  sales_employee_id: string; // 销售员工ID（兼容旧字段）
  notes?: string; // 备注
  created_at: string;
  vehicle?: Vehicle;
  sales_employee?: Employee;
}

// 费用记录
export interface Expense {
  id: string;
  expense_date: string;
  expense_type: string;
  amount: number;
  description?: string;
  created_by: string;
  created_at: string;
  creator?: Profile;
}

// 利润分配记录
export interface ProfitDistribution {
  id: string;
  sale_id: string;
  employee_id: string;
  role_type: EmployeeRoleType;
  distribution_amount: number;
  distribution_percentage: number;
  created_at: string;
  sale?: VehicleSale;
  employee?: Employee;
}

// 月度奖金池
export interface MonthlyBonus {
  id: string;
  year: number;
  month: number;
  total_bonus_pool: number; // 总奖金池金额
  distributed_amount: number; // 已分配金额
  remaining_amount: number; // 剩余金额
  champion_employee_id?: string; // 月度销售冠军ID
  champion_bonus?: number; // 冠军奖金
  created_at: string;
  updated_at: string;
  champion?: Employee;
}

// 统计数据类型
export interface SalesStatistics {
  total_sales: number;
  total_revenue: number;
  total_profit: number;
  average_price: number;
  vehicle_count: number;
}

export interface EmployeePerformance {
  employee_id: string;
  employee_name: string;
  sales_count: number;
  total_sales_amount: number;
  total_profit: number;
  total_commission: number;
}
