import { supabase } from './supabase';
import type {
  Profile,
  Dealership,
  Employee,
  EmployeeRole,
  Vehicle,
  VehicleCost,
  VehicleSale,
  Expense,
  ProfitDistribution,
  MonthlyBonus,
  EmployeeRoleType,
  ProfitRule,
} from '@/types/types';

// ==================== 辅助函数 ====================
// 获取当前用户的车行ID
export async function getCurrentDealershipId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('dealership_id')
    .eq('id', user.id)
    .maybeSingle();
  
  if (error) throw error;
  if (!profile?.dealership_id) throw new Error('用户未关联车行');
  
  return profile.dealership_id;
}

// ==================== 车行管理 API ====================
export const dealershipsApi = {
  // 获取所有车行（仅 super_admin）
  async getAll() {
    const { data, error } = await supabase
      .from('dealerships')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Dealership[];
  },

  // 获取当前用户的车行
  async getCurrent() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('dealership:dealerships(*)')
      .eq('id', user.id)
      .maybeSingle();
    
    if (profileError) throw profileError;
    if (!profile) return null;
    
    // dealership 是一个对象，不是数组
    const dealership = profile.dealership as unknown;
    return dealership as Dealership | null;
  },

  // 根据ID获取车行
  async getById(id: string) {
    const { data, error } = await supabase
      .from('dealerships')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data as Dealership | null;
  },

  // 创建新车行
  async create(dealership: Omit<Dealership, 'id' | 'created_at' | 'updated_at'>) {
    // 使用 RPC 函数来创建车行，绕过 RLS 限制
    const { data, error } = await supabase.rpc('register_dealership', {
      p_name: dealership.name,
      p_code: dealership.code,
      p_contact_person: dealership.contact_person || null,
      p_contact_phone: dealership.contact_phone || null,
      p_address: dealership.address || null,
      p_business_license: dealership.business_license || null,
      p_province: dealership.province || null,
      p_city: dealership.city || null,
      p_district: dealership.district || null,
    });
    
    if (error) throw error;
    return data as Dealership;
  },

  // 更新车行信息
  async update(id: string, dealership: Partial<Dealership>) {
    const { data, error } = await supabase
      .from('dealerships')
      .update(dealership)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Dealership;
  },

  // 删除车行
  async delete(id: string) {
    const { error } = await supabase
      .from('dealerships')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// ==================== 用户资料 API ====================
export const profilesApi = {
  // 获取所有用户资料
  async getAll() {
    console.log('👥 [profilesApi] 开始查询所有用户资料...');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('👥 [profilesApi] ❌ 查询失败:', error);
        console.error('错误详情:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log('👥 [profilesApi] ✅ 查询成功，用户数量:', data?.length || 0);
      console.log('👥 [profilesApi] 📋 用户数据:', data);
      
      if (!data || data.length === 0) {
        console.warn('👥 [profilesApi] ⚠️ 警告：查询成功但返回空数组');
      }
      
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('👥 [profilesApi] ❌ 发生异常:', err);
      return [];
    }
  },

  // 获取单个用户资料
  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 根据车行ID获取用户列表
  async getByDealership(dealershipId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('dealership_id', dealershipId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 更新用户角色
  async updateRole(id: string, role: 'admin' | 'employee') {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 更新用户资料（通用方法）
  async update(id: string, updates: Partial<{ username: string; role: string; phone: string; status: string; default_password: string; id_card_front_photo: string; id_card_back_photo: string }>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 创建新用户（管理员添加员工）
  async createUser(username: string, password: string, phone?: string, id_card_front_photo?: string, id_card_back_photo?: string) {
    // 自动生成内部邮箱（使用用户名）
    const email = `${username.toLowerCase().replace(/\s+/g, '')}@yichi.internal`;
    
    // 1. 使用 Supabase Auth 创建用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          phone,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('创建用户失败');

    // 2. 更新 profiles 表，添加默认密码标记和身份证照片
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        username,
        phone: phone || null,
        role: 'employee',
        status: 'active',
        default_password: password === '123456' ? '123456' : null,
        id_card_front_photo: id_card_front_photo || null,
        id_card_back_photo: id_card_back_photo || null,
      })
      .eq('id', authData.user.id)
      .select()
      .maybeSingle();

    if (profileError) throw profileError;
    return profileData;
  },

  // 更新用户状态（在职/离职）
  async updateStatus(id: string, status: 'active' | 'inactive') {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 重置用户密码为默认密码123456
  async resetPassword(userId: string) {
    // 使用 Supabase Admin API 重置密码
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { password: '123456' }
    );
    if (error) throw error;

    // 更新 profiles 表，标记为使用默认密码
    await supabase
      .from('profiles')
      .update({ default_password: '123456' })
      .eq('id', userId);

    return data;
  },

  // 审核通过员工申请
  async approveEmployee(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 拒绝员工申请
  async rejectEmployee(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'inactive' })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};

// ==================== 员工 API ====================
export const employeesApi = {
  // 获取所有员工
  async getAll() {
    const { data, error } = await supabase
      .from('employees')
      .select('*, profile:profiles(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 获取活跃员工
  async getActive() {
    const { data, error } = await supabase
      .from('employees')
      .select('*, profile:profiles(*)')
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 获取单个员工
  async getById(id: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*, profile:profiles(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 创建员工
  async create(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('employees')
      .insert(employee)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 更新员工
  async update(id: string, employee: Partial<Employee>) {
    const { data, error } = await supabase
      .from('employees')
      .update(employee)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 删除员工
  async delete(id: string) {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};


// ==================== 车辆 API ====================
export const vehiclesApi = {
  // 获取所有车辆（仅当前车行）
  async getAll() {
    const dealershipId = await getCurrentDealershipId();
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('dealership_id', dealershipId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 获取在售车辆（仅当前车行）
  async getInStock() {
    const dealershipId = await getCurrentDealershipId();
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('dealership_id', dealershipId)
      .eq('status', 'in_stock')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 获取所有在售车辆（公开访问，不需要登录）
  async getAllInStock() {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        dealership:dealerships(*)
      `)
      .eq('status', 'in_stock')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 获取已售车辆（仅当前车行）
  async getSold() {
    const dealershipId = await getCurrentDealershipId();
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('dealership_id', dealershipId)
      .eq('status', 'sold')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 获取单个车辆
  async getById(id: string) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 创建车辆
  async create(vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('vehicles')
      .insert(vehicle)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 更新车辆
  async update(id: string, vehicle: Partial<Vehicle>) {
    const { data, error } = await supabase
      .from('vehicles')
      .update(vehicle)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 删除车辆
  async delete(id: string) {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ==================== 车辆成本 API ====================
export const vehicleCostsApi = {
  // 获取车辆的所有成本
  async getByVehicleId(vehicleId: string) {
    const { data, error } = await supabase
      .from('vehicle_costs')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 添加车辆成本
  async add(cost: Omit<VehicleCost, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('vehicle_costs')
      .insert(cost)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 删除车辆成本
  async delete(id: string) {
    const { error } = await supabase
      .from('vehicle_costs')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ==================== 车辆销售 API ====================
export const vehicleSalesApi = {
  // 获取所有销售记录
  async getAll() {
    const { data, error } = await supabase
      .from('vehicle_sales')
      .select('*, vehicle:vehicles(*), sales_employee:profiles!sales_employee_id(*)')
      .order('sale_date', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 获取指定月份的销售记录
  async getByMonth(year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = month === 12 
      ? `${year + 1}-01-01` 
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;

    const { data, error } = await supabase
      .from('vehicle_sales')
      .select('*, vehicle:vehicles(*), sales_employee:profiles!sales_employee_id(*)')
      .gte('sale_date', startDate)
      .lt('sale_date', endDate)
      .order('sale_date', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 获取单个销售记录
  async getById(id: string) {
    const { data, error } = await supabase
      .from('vehicle_sales')
      .select('*, vehicle:vehicles(*), sales_employee:profiles!sales_employee_id(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 创建销售记录
  async create(sale: Omit<VehicleSale, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('vehicle_sales')
      .insert(sale)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 更新销售记录
  async update(id: string, sale: Partial<VehicleSale>) {
    const { data, error } = await supabase
      .from('vehicle_sales')
      .update(sale)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 删除销售记录
  async delete(id: string) {
    const { error } = await supabase
      .from('vehicle_sales')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ==================== 费用 API ====================
export const expensesApi = {
  // 获取所有费用
  async getAll() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, creator:profiles(*)')
      .order('expense_date', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 获取指定月份的费用
  async getByMonth(year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = month === 12 
      ? `${year + 1}-01-01` 
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;

    const { data, error } = await supabase
      .from('expenses')
      .select('*, creator:profiles(*)')
      .gte('expense_date', startDate)
      .lt('expense_date', endDate)
      .order('expense_date', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 创建费用记录
  async create(expense: Omit<Expense, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 更新费用记录
  async update(id: string, expense: Partial<Expense>) {
    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 删除费用记录
  async delete(id: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ==================== 利润分配 API ====================
export const profitDistributionsApi = {
  // 获取销售的利润分配
  async getBySaleId(saleId: string) {
    const { data, error } = await supabase
      .from('profit_distributions')
      .select('*, employee:employees(*, profile:profiles(*)), sale:vehicle_sales(*)')
      .eq('sale_id', saleId);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 获取员工的利润分配
  async getByEmployeeId(employeeId: string) {
    const { data, error } = await supabase
      .from('profit_distributions')
      .select('*, sale:vehicle_sales(*, vehicle:vehicles(*))')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 创建利润分配
  async create(distribution: Omit<ProfitDistribution, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('profit_distributions')
      .insert(distribution)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 批量创建利润分配
  async createBatch(distributions: Omit<ProfitDistribution, 'id' | 'created_at'>[]) {
    const { data, error } = await supabase
      .from('profit_distributions')
      .insert(distributions)
      .select();
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 删除利润分配
  async delete(id: string) {
    const { error } = await supabase
      .from('profit_distributions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ==================== 月度奖金 API ====================
export const monthlyBonusesApi = {
  // 获取所有月度奖金
  async getAll() {
    const { data, error } = await supabase
      .from('monthly_bonuses')
      .select('*, champion:employees(*, profile:profiles(*))')
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 获取指定月份的奖金
  async getByMonth(year: number, month: number) {
    const { data, error } = await supabase
      .from('monthly_bonuses')
      .select('*, champion:employees(*, profile:profiles(*))')
      .eq('year', year)
      .eq('month', month)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 创建或更新月度奖金
  async upsert(bonus: Omit<MonthlyBonus, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('monthly_bonuses')
      .upsert(bonus, { onConflict: 'year,month' })
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};

// ==================== 图片上传 API ====================
export const storageApi = {
  // 上传车辆图片
  async uploadVehicleImage(file: File, fileName: string) {
    const { data, error } = await supabase.storage
      .from('app_8u0242wc45c1_vehicle_images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    if (error) throw error;
    
    // 获取公开URL
    const { data: { publicUrl } } = supabase.storage
      .from('app_8u0242wc45c1_vehicle_images')
      .getPublicUrl(data.path);
    
    return publicUrl;
  },

  // 删除车辆图片
  async deleteVehicleImage(path: string) {
    const { error } = await supabase.storage
      .from('app_8u0242wc45c1_vehicle_images')
      .remove([path]);
    if (error) throw error;
  },
};

// ==================== 提成规则 API ====================
export const profitRulesApi = {
  // 获取当前生效的规则
  async getActive() {
    const { data, error } = await supabase
      .from('profit_rules')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 获取所有规则
  async getAll() {
    const { data, error } = await supabase
      .from('profit_rules')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 更新规则
  async update(id: string, updates: Partial<ProfitRule>) {
    // 先将所有规则设置为非活跃
    await supabase
      .from('profit_rules')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // 更新指定规则并设置为活跃
    const { data, error } = await supabase
      .from('profit_rules')
      .update({ ...updates, is_active: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 创建新规则
  async create(rule: Omit<ProfitRule, 'id' | 'created_at' | 'updated_at'>) {
    // 先将所有规则设置为非活跃
    await supabase
      .from('profit_rules')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // 创建新规则并设置为活跃
    const { data, error } = await supabase
      .from('profit_rules')
      .insert([{ ...rule, is_active: true }])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};
