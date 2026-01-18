// 用户角色枚举
export type UserRole = 'super_admin' | 'admin' | 'employee';

// 员工角色类型
export type EmployeeRoleType = 'landlord' | 'bonus_pool' | 'sales_commission' | 'investor';

// 车辆状态
export type VehicleStatus = 'in_stock' | 'sold';

// 车辆类型
export type VehicleType = 'sedan' | 'suv' | 'mpv' | 'coupe' | 'hatchback' | 'pickup' | 'van' | 'sports';

// 变速箱类型
export type TransmissionType = 'manual' | 'automatic' | 'cvt' | 'dct' | 'amt';

// 驱动方式
export type DriveType = 'fwd' | 'rwd' | 'awd' | '4wd';

// 燃料类型
export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'phev';

// 排放标准
export type EmissionStandard = 'national_3' | 'national_4' | 'national_5' | 'national_6a' | 'national_6b';

// 车行信息
export interface Dealership {
  id: string;
  name: string;
  code: string;
  contact_person?: string;
  contact_phone?: string;
  address?: string;
  business_license?: string; // 营业执照URL
  province?: string; // 省份
  city?: string; // 城市
  district?: string; // 区县
  status: 'pending' | 'active' | 'inactive' | 'rejected'; // pending-待审核, active-已激活, inactive-已停用, rejected-审核拒绝
  rejected_reason?: string; // 拒绝原因
  reviewed_at?: string; // 审核时间
  reviewed_by?: string; // 审核人ID
  rent_investor_ids?: string[]; // 场地老板ID列表
  created_at: string;
  updated_at: string;
}

// 用户资料
export interface Profile {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  role: UserRole;
  dealership_id: string;
  status?: 'active' | 'inactive';
  default_password?: string;
  created_at: string;
  updated_at: string;
  dealership?: Dealership;
}

// 员工信息
export interface Employee {
  id: string;
  profile_id: string;
  dealership_id: string;
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
  dealership_id: string;
  
  // 基本识别信息
  vin_last_six: string; // 车架号后六位（唯一标识）
  vin_full?: string; // 完整车架号（VIN）
  plate_number: string; // 车牌号
  engine_number?: string; // 发动机号
  
  // 车辆基本信息
  brand: string; // 品牌
  model: string; // 型号
  vehicle_type?: VehicleType; // 车辆类型
  year: number; // 年份
  mileage: number; // 里程数
  
  // 车辆技术参数
  displacement?: number; // 排量（升）
  is_turbo?: boolean; // 是否涡轮增压（T=涡轮，L=自然吸气）
  transmission_type?: TransmissionType; // 变速箱类型
  drive_type?: DriveType; // 驱动方式
  fuel_type?: FuelType; // 燃料类型
  emission_standard?: EmissionStandard; // 排放标准
  seats?: number; // 座位数
  
  // 车辆外观
  exterior_color?: string; // 车身颜色
  interior_color?: string; // 内饰颜色
  
  // 车辆状态
  transfer_count: number; // 过户次数
  is_accident?: boolean; // 是否事故车
  is_flooded?: boolean; // 是否泡水车
  is_fire?: boolean; // 是否火烧车
  condition_description?: string; // 车况描述
  
  // 证件信息
  insurance_expiry?: string; // 保险到期日
  inspection_expiry?: string; // 年检到期日
  
  // 价格信息
  original_price?: number; // 新车指导价
  purchase_price: number; // 购车款
  selling_price?: number; // 预售报价
  
  // 其他
  photos: string[]; // 照片URL数组
  status: VehicleStatus; // 车辆状态
  investor_ids: string[]; // 押车出资人ID列表
  
  created_at: string;
  updated_at: string;
}

// 车辆成本明细
export interface VehicleCost {
  id: string;
  vehicle_id: string;
  dealership_id: string;
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
  dealership_id: string;
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
  salesperson_id?: string; // 销售员ID（可选）
  sales_employee_id?: string; // 销售员工ID（可选，兼容旧字段）
  notes?: string; // 备注
  created_at: string;
  vehicle?: Vehicle;
  sales_employee?: Profile;
}

// 费用记录
export interface Expense {
  id: string;
  dealership_id: string;
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
  dealership_id: string;
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
  dealership_id: string;
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

// 提成规则
export interface ProfitRule {
  id: string;
  dealership_id: string;
  rent_investor_rate: number;
  bonus_pool_rate: number;
  salesperson_rate: number;
  investor_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
