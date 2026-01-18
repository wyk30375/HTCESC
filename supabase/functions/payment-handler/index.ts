import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // 创建支付订单
    if (action === 'create' && req.method === 'POST') {
      const { dealership_id, tier_id, payment_method } = await req.json()

      if (!dealership_id || !tier_id) {
        return new Response(
          JSON.stringify({ error: '缺少必要参数' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 调用数据库函数创建订单
      const { data, error } = await supabaseClient.rpc('create_payment_order', {
        p_dealership_id: dealership_id,
        p_tier_id: tier_id,
        p_payment_method: payment_method || 'qrcode'
      })

      if (error) {
        console.error('创建订单失败:', error)
        return new Response(
          JSON.stringify({ error: '创建订单失败', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 生成二维码URL（模拟）
      const qrCodeData = {
        order_no: data.order_no,
        amount: data.amount,
        timestamp: new Date().getTime()
      }
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify(qrCodeData))}`

      // 更新订单的二维码URL
      await supabaseClient
        .from('payment_orders')
        .update({ qr_code_url: qrCodeUrl })
        .eq('order_no', data.order_no)

      return new Response(
        JSON.stringify({
          success: true,
          order: {
            ...data,
            qr_code_url: qrCodeUrl
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 模拟支付（用于测试）
    if (action === 'simulate-pay' && req.method === 'POST') {
      const { order_no } = await req.json()

      if (!order_no) {
        return new Response(
          JSON.stringify({ error: '缺少订单号' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 调用支付成功处理函数
      const { data, error } = await supabaseClient.rpc('process_payment_success', {
        p_order_no: order_no
      })

      if (error) {
        console.error('处理支付失败:', error)
        return new Response(
          JSON.stringify({ error: '处理支付失败', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 检查订单状态
    if (action === 'check' && req.method === 'GET') {
      const order_no = url.searchParams.get('order_no')

      if (!order_no) {
        return new Response(
          JSON.stringify({ error: '缺少订单号' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data, error } = await supabaseClient.rpc('check_order_status', {
        p_order_no: order_no
      })

      if (error) {
        console.error('查询订单失败:', error)
        return new Response(
          JSON.stringify({ error: '查询订单失败', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 支付回调（真实环境中由支付平台调用）
    if (action === 'callback' && req.method === 'POST') {
      const { order_no, transaction_id, payment_status } = await req.json()

      if (!order_no) {
        return new Response(
          JSON.stringify({ error: '缺少订单号' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 验证支付状态
      if (payment_status === 'success') {
        const { data, error } = await supabaseClient.rpc('process_payment_success', {
          p_order_no: order_no
        })

        if (error) {
          console.error('处理支付回调失败:', error)
          return new Response(
            JSON.stringify({ error: '处理支付回调失败', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: '支付成功' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: false, message: '支付失败' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: '无效的操作' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('处理请求失败:', error)
    return new Response(
      JSON.stringify({ error: '服务器错误', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
