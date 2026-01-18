import { supabase } from './supabase';
import type { MembershipTier, DealershipMembership, MembershipPayment } from '@/types/types';

/**
 * 会员管理API
 */

// 获取所有会员等级
export async function getMembershipTiers(): Promise<MembershipTier[]> {
  const { data, error } = await supabase
    .from('membership_tiers')
    .select('*')
    .order('tier_level', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 获取车商当前会员信息
export async function getCurrentMembership(dealershipId: string): Promise<DealershipMembership | null> {
  const { data, error } = await supabase
    .from('dealership_memberships')
    .select(`
      *,
      tier:membership_tiers(*)
    `)
    .eq('dealership_id', dealershipId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 获取车商所有会员历史记录
export async function getMembershipHistory(dealershipId: string): Promise<DealershipMembership[]> {
  const { data, error } = await supabase
    .from('dealership_memberships')
    .select(`
      *,
      tier:membership_tiers(*)
    `)
    .eq('dealership_id', dealershipId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 获取车商在售车辆数量
export async function getDealershipVehicleCount(dealershipId: string): Promise<number> {
  const { count, error } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('dealership_id', dealershipId)
    .eq('status', 'in_stock');

  if (error) throw error;
  return count || 0;
}

// 根据车辆数量计算应有的会员等级
export async function calculateMembershipTier(vehicleCount: number): Promise<MembershipTier | null> {
  const { data, error } = await supabase
    .from('membership_tiers')
    .select('*')
    .lte('min_vehicles', vehicleCount)
    .or(`max_vehicles.is.null,max_vehicles.gte.${vehicleCount}`)
    .order('tier_level', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 初始化车商会员（审核通过时调用）
export async function initializeDealershipMembership(dealershipId: string): Promise<string> {
  const { data, error } = await supabase.rpc('initialize_dealership_membership', {
    p_dealership_id: dealershipId
  });

  if (error) throw error;
  return data;
}

// 更新车商会员等级（车辆数量变化时调用）
export async function updateDealershipMembershipTier(dealershipId: string): Promise<void> {
  const { error } = await supabase.rpc('update_dealership_membership_tier', {
    p_dealership_id: dealershipId
  });

  if (error) throw error;
}

// 检查会员状态（是否在免费期、是否到期等）
export async function checkMembershipStatus(dealershipId: string): Promise<{
  isActive: boolean;
  isTrial: boolean;
  isExpired: boolean;
  daysUntilExpiry: number | null;
  currentTier: MembershipTier | null;
  vehicleCount: number;
  suggestedTier: MembershipTier | null;
}> {
  const membership = await getCurrentMembership(dealershipId);
  const vehicleCount = await getDealershipVehicleCount(dealershipId);
  const suggestedTier = await calculateMembershipTier(vehicleCount);

  if (!membership) {
    return {
      isActive: false,
      isTrial: false,
      isExpired: true,
      daysUntilExpiry: null,
      currentTier: null,
      vehicleCount,
      suggestedTier
    };
  }

  const now = new Date();
  const endDate = membership.end_date ? new Date(membership.end_date) : null;
  const trialEndDate = membership.trial_end_date ? new Date(membership.trial_end_date) : null;

  let daysUntilExpiry: number | null = null;
  if (endDate) {
    daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  const isExpired = endDate ? now > endDate : false;
  const isTrial = membership.is_trial && trialEndDate ? now <= trialEndDate : false;

  return {
    isActive: membership.status === 'active' && !isExpired,
    isTrial,
    isExpired,
    daysUntilExpiry,
    currentTier: membership.tier || null,
    vehicleCount,
    suggestedTier
  };
}

// 续费会员
export async function renewMembership(
  dealershipId: string,
  tierId: string,
  paymentMethod?: string
): Promise<{ membershipId: string; paymentId: string }> {
  // 获取会员等级信息
  const { data: tier, error: tierError } = await supabase
    .from('membership_tiers')
    .select('*')
    .eq('id', tierId)
    .single();

  if (tierError) throw tierError;

  // 计算新的结束日期（从当前日期起1年）
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);

  // 创建新的会员记录
  const { data: membership, error: membershipError } = await supabase
    .from('dealership_memberships')
    .insert({
      dealership_id: dealershipId,
      tier_id: tierId,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      is_trial: false,
      trial_end_date: null,
      status: 'active'
    })
    .select()
    .single();

  if (membershipError) throw membershipError;

  // 创建支付记录
  const { data: payment, error: paymentError } = await supabase
    .from('membership_payments')
    .insert({
      membership_id: membership.id,
      dealership_id: dealershipId,
      amount: tier.annual_fee,
      payment_method: paymentMethod || '待支付',
      payment_status: 'pending',
      payment_date: null
    })
    .select()
    .single();

  if (paymentError) throw paymentError;

  return {
    membershipId: membership.id,
    paymentId: payment.id
  };
}

// 更新支付状态
export async function updatePaymentStatus(
  paymentId: string,
  status: 'completed' | 'failed' | 'refunded',
  transactionId?: string
): Promise<void> {
  const { error } = await supabase
    .from('membership_payments')
    .update({
      payment_status: status,
      payment_date: status === 'completed' ? new Date().toISOString() : null,
      transaction_id: transactionId || null
    })
    .eq('id', paymentId);

  if (error) throw error;
}

// 获取支付历史
export async function getPaymentHistory(dealershipId: string): Promise<MembershipPayment[]> {
  const { data, error } = await supabase
    .from('membership_payments')
    .select(`
      *,
      membership:dealership_memberships(
        *,
        tier:membership_tiers(*)
      )
    `)
    .eq('dealership_id', dealershipId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 获取所有车商会员信息（超级管理员用）
export async function getAllDealershipMemberships(): Promise<DealershipMembership[]> {
  // 查询所有车行及其活跃的会员记录
  const { data, error } = await supabase
    .from('dealerships')
    .select(`
      id,
      name,
      status,
      created_at,
      memberships:dealership_memberships!dealership_memberships_dealership_id_fkey(
        id,
        tier_id,
        start_date,
        end_date,
        is_trial,
        trial_end_date,
        status,
        created_at,
        updated_at,
        tier:membership_tiers(*)
      )
    `)
    .eq('memberships.status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // 转换数据格式，将车行信息和会员信息合并
  const result = (data || []).map(dealership => {
    const membership = dealership.memberships?.[0];
    if (membership) {
      return {
        ...membership,
        dealership: {
          id: dealership.id,
          name: dealership.name,
          status: dealership.status
        }
      };
    } else {
      // 没有会员记录的车行，返回一个空的会员对象
      return {
        id: null,
        dealership_id: dealership.id,
        tier_id: null,
        start_date: null,
        end_date: null,
        is_trial: null,
        trial_end_date: null,
        status: null,
        created_at: dealership.created_at,
        updated_at: null,
        tier: null,
        dealership: {
          id: dealership.id,
          name: dealership.name,
          status: dealership.status
        }
      };
    }
  });

  return result as unknown as DealershipMembership[];
}

// 手动更新会员信息（超级管理员用）
export async function updateMembership(
  membershipId: string,
  updates: Partial<DealershipMembership>
): Promise<void> {
  const { error } = await supabase
    .from('dealership_memberships')
    .update(updates)
    .eq('id', membershipId);

  if (error) throw error;
}
