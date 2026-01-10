import { supabase } from './supabase';
import type {
  Profile,
  Employee,
  EmployeeRole,
  Vehicle,
  VehicleCost,
  VehicleSale,
  Expense,
  ProfitDistribution,
  MonthlyBonus,
  EmployeeRoleType,
} from '@/types/types';

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
  async update(id: string, updates: Partial<{ username: string; role: string; phone: string }>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
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
  // 获取所有车辆
  async getAll() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // 获取在售车辆
  async getInStock() {
    console.log('🚗 [简化版] 开始查询在库车辆...');
    console.log('🔑 当前用户会话:', await supabase.auth.getSession());
    
    try {
      // 直接查询所有车辆，不使用任何条件
      console.log('🔍 查询所有车辆（无条件）');
      const { data: allVehicles, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ 查询失败:', error);
        console.error('错误详情:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log('✅ 查询成功，总车辆数:', allVehicles?.length || 0);
      console.log('📋 所有车辆数据:', allVehicles);
      
      if (!allVehicles || allVehicles.length === 0) {
        console.warn('⚠️ 数据库中没有任何车辆数据');
        return [];
      }
      
      // 在前端过滤在库车辆
      console.log('🔄 在前端过滤 status=in_stock 的车辆');
      const inStockVehicles = allVehicles.filter(v => {
        console.log(`  - 车辆 ${v.brand} ${v.model}: status=${v.status}`);
        return v.status === 'in_stock';
      });
      
      console.log('✅ 过滤完成，在库车辆数:', inStockVehicles.length);
      console.log('📋 在库车辆列表:', inStockVehicles);
      
      return inStockVehicles;
    } catch (err) {
      console.error('❌ 发生异常:', err);
      return [];
    }
  },

  // 获取已售车辆
  async getSold() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
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
