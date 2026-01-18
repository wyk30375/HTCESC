import { supabase } from './supabase';
import type { PaymentOrder } from '@/types/types';

/**
 * 支付订单API
 */

// 创建支付订单
export async function createPaymentOrder(
  dealershipId: string,
  tierId: string,
  paymentMethod: string = 'qrcode'
): Promise<{
  order_id: string;
  order_no: string;
  amount: number;
  expired_at: string;
  qr_code_url: string;
}> {
  const { data, error } = await supabase.functions.invoke('payment-handler', {
    body: {
      dealership_id: dealershipId,
      tier_id: tierId,
      payment_method: paymentMethod
    },
    method: 'POST'
  });

  if (error) {
    console.error('创建支付订单失败:', error);
    throw new Error(error.message || '创建支付订单失败');
  }

  if (!data.success) {
    throw new Error(data.error || '创建支付订单失败');
  }

  return data.order;
}

// 检查订单状态
export async function checkOrderStatus(orderNo: string): Promise<PaymentOrder | null> {
  const { data, error } = await supabase.functions.invoke(
    `payment-handler?action=check&order_no=${orderNo}`,
    {
      method: 'GET'
    }
  );

  if (error) {
    console.error('查询订单状态失败:', error);
    throw new Error(error.message || '查询订单状态失败');
  }

  if (!data.success) {
    throw new Error(data.message || '查询订单状态失败');
  }

  return data.order;
}

// 模拟支付（用于测试）
export async function simulatePayment(orderNo: string): Promise<{
  success: boolean;
  message: string;
}> {
  const { data, error } = await supabase.functions.invoke('payment-handler', {
    body: {
      order_no: orderNo
    },
    method: 'POST'
  });

  if (error) {
    console.error('模拟支付失败:', error);
    throw new Error(error.message || '模拟支付失败');
  }

  return data;
}

// 获取车商的支付订单列表
export async function getPaymentOrders(dealershipId: string): Promise<PaymentOrder[]> {
  const { data, error } = await supabase
    .from('payment_orders')
    .select(`
      *,
      tier:membership_tiers(*)
    `)
    .eq('dealership_id', dealershipId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 取消订单
export async function cancelPaymentOrder(orderId: string): Promise<void> {
  const { error } = await supabase
    .from('payment_orders')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .in('status', ['pending', 'paying']);

  if (error) throw error;
}
