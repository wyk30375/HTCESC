# 💰 线上支付功能实现完整教程

## 📖 目录

1. [支付基础知识](#支付基础知识)
2. [支付流程详解](#支付流程详解)
3. [技术选型](#技术选型)
4. [环境准备](#环境准备)
5. [代码实现](#代码实现)
6. [测试方法](#测试方法)
7. [安全注意事项](#安全注意事项)
8. [常见问题](#常见问题)

---

## 📚 支付基础知识

### 什么是线上支付？

线上支付是指用户通过互联网完成支付的过程，包括：
- 微信支付
- 支付宝支付
- 银行卡支付
- 国际支付（Stripe、PayPal等）

### 支付的核心概念

#### 1. 商户号（Merchant ID）
- 支付平台分配给商家的唯一标识
- 用于识别收款方
- 需要企业资质申请

#### 2. API密钥（API Key/Secret）
- 用于验证请求的合法性
- 需要妥善保管，不能泄露
- 通常包括：
  - App ID：应用标识
  - App Secret：应用密钥
  - API Key：接口密钥

#### 3. 回调通知（Callback/Webhook）
- 支付完成后，支付平台主动通知商户
- 商户需要提供一个公网可访问的URL
- 用于更新订单状态

#### 4. 订单号（Order ID）
- 商户系统生成的唯一订单标识
- 用于关联支付和业务订单
- 必须保证唯一性

---

## 🔄 支付流程详解

### 完整支付流程（以微信支付为例）

```
┌─────────┐         ┌─────────┐         ┌─────────┐         ┌─────────┐
│  用户   │         │  商户   │         │  微信   │         │  银行   │
│  前端   │         │  后端   │         │  支付   │         │         │
└────┬────┘         └────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │                   │
     │ 1. 发起支付请求   │                   │                   │
     ├──────────────────>│                   │                   │
     │                   │                   │                   │
     │                   │ 2. 创建支付订单   │                   │
     │                   ├──────────────────>│                   │
     │                   │                   │                   │
     │                   │ 3. 返回支付参数   │                   │
     │                   │<──────────────────┤                   │
     │                   │                   │                   │
     │ 4. 返回支付信息   │                   │                   │
     │<──────────────────┤                   │                   │
     │                   │                   │                   │
     │ 5. 调起支付界面   │                   │                   │
     ├──────────────────────────────────────>│                   │
     │                   │                   │                   │
     │                   │                   │ 6. 请求扣款       │
     │                   │                   ├──────────────────>│
     │                   │                   │                   │
     │                   │                   │ 7. 扣款成功       │
     │                   │                   │<──────────────────┤
     │                   │                   │                   │
     │ 8. 支付成功提示   │                   │                   │
     │<──────────────────────────────────────┤                   │
     │                   │                   │                   │
     │                   │ 9. 异步通知       │                   │
     │                   │<──────────────────┤                   │
     │                   │                   │                   │
     │                   │ 10. 更新订单状态  │                   │
     │                   │                   │                   │
     │                   │ 11. 返回成功      │                   │
     │                   ├──────────────────>│                   │
     │                   │                   │                   │
     │ 12. 查询订单状态  │                   │                   │
     ├──────────────────>│                   │                   │
     │                   │                   │                   │
     │ 13. 返回支付结果  │                   │                   │
     │<──────────────────┤                   │                   │
     │                   │                   │                   │
```

### 关键步骤说明

#### 步骤1-4：创建支付订单
- 用户点击"支付"按钮
- 前端发送支付请求到后端
- 后端调用支付平台API创建订单
- 返回支付参数给前端

#### 步骤5-8：用户完成支付
- 前端调起支付界面（微信/支付宝）
- 用户输入密码完成支付
- 支付平台扣款
- 显示支付结果

#### 步骤9-11：异步通知（最重要）
- 支付平台主动通知商户后端
- 商户验证通知的真实性
- 更新订单状态
- 返回成功响应

#### 步骤12-13：查询结果
- 前端查询订单状态
- 显示支付结果给用户

---

## 🎯 技术选型

### 国内支付方式

#### 1. 微信支付
- **优势**：用户基数大，使用方便
- **适用场景**：H5、小程序、App、扫码支付
- **申请要求**：企业资质、营业执照
- **费率**：0.6%（一般商户）
- **官方文档**：https://pay.weixin.qq.com/

#### 2. 支付宝支付
- **优势**：信任度高，支持多种场景
- **适用场景**：网页、App、扫码支付
- **申请要求**：企业资质、营业执照
- **费率**：0.6%（一般商户）
- **官方文档**：https://open.alipay.com/

### 国际支付方式

#### 3. Stripe
- **优势**：开发友好，文档完善
- **适用场景**：国际信用卡支付
- **申请要求**：相对简单
- **费率**：2.9% + $0.30/笔
- **官方文档**：https://stripe.com/docs

#### 4. PayPal
- **优势**：国际知名度高
- **适用场景**：跨境支付
- **申请要求**：个人或企业均可
- **费率**：3.4% + 固定费用
- **官方文档**：https://developer.paypal.com/

### 本教程选择

我们将实现：
1. **模拟支付**（用于开发测试，无需真实商户号）
2. **Stripe支付**（真实支付，申请简单，适合学习）
3. **微信/支付宝支付框架**（提供代码框架，需要商户号）

---

## 🛠️ 环境准备

### 1. 注册Stripe账号（用于真实支付测试）

```bash
# 访问Stripe官网
https://stripe.com/

# 注册账号（免费）
# 获取测试密钥：
# - Publishable key（公开密钥，前端使用）
# - Secret key（私密密钥，后端使用）
```

### 2. 安装Stripe SDK

```bash
# 安装Stripe Node.js SDK
npm install stripe

# 安装Stripe React组件
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 3. 配置环境变量

在`.env`文件中添加：

```env
# Stripe配置
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# 支付回调地址
VITE_PAYMENT_CALLBACK_URL=https://your-domain.com/api/payment/callback
```

---

## 💻 代码实现

### 数据库设计

#### 1. 支付订单表（payment_orders）

```sql
CREATE TABLE payment_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_no VARCHAR(64) UNIQUE NOT NULL,           -- 订单号
  dealership_id UUID REFERENCES dealerships(id),  -- 车行ID
  user_id UUID REFERENCES auth.users(id),         -- 用户ID
  
  -- 订单信息
  amount DECIMAL(10, 2) NOT NULL,                 -- 支付金额
  currency VARCHAR(3) DEFAULT 'CNY',              -- 货币类型
  subject VARCHAR(256) NOT NULL,                  -- 订单标题
  description TEXT,                               -- 订单描述
  
  -- 支付信息
  payment_method VARCHAR(32),                     -- 支付方式：wechat/alipay/stripe
  payment_status VARCHAR(32) DEFAULT 'pending',   -- 支付状态：pending/paid/failed/refunded
  payment_time TIMESTAMP,                         -- 支付时间
  
  -- 第三方信息
  transaction_id VARCHAR(128),                    -- 第三方交易号
  payment_data JSONB,                             -- 支付平台返回的数据
  
  -- 业务关联
  business_type VARCHAR(32),                      -- 业务类型：membership/deposit/vehicle
  business_id UUID,                               -- 业务ID
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_payment_orders_order_no ON payment_orders(order_no);
CREATE INDEX idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX idx_payment_orders_status ON payment_orders(payment_status);
CREATE INDEX idx_payment_orders_transaction_id ON payment_orders(transaction_id);
```

#### 2. 支付回调日志表（payment_callbacks）

```sql
CREATE TABLE payment_callbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_no VARCHAR(64) NOT NULL,                  -- 订单号
  payment_method VARCHAR(32),                     -- 支付方式
  callback_data JSONB,                            -- 回调数据
  is_verified BOOLEAN DEFAULT FALSE,              -- 是否验证通过
  is_processed BOOLEAN DEFAULT FALSE,             -- 是否已处理
  error_message TEXT,                             -- 错误信息
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_payment_callbacks_order_no ON payment_callbacks(order_no);
CREATE INDEX idx_payment_callbacks_created_at ON payment_callbacks(created_at);
```

### 后端实现

#### 1. 创建Supabase Edge Function：创建支付订单

```typescript
// supabase/functions/create-payment/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.0.0'

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
    // 1. 获取请求参数
    const { amount, currency, subject, description, businessType, businessId, paymentMethod } = await req.json()

    // 2. 验证用户身份
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      throw new Error('未授权')
    }

    // 3. 生成订单号
    const orderNo = `PAY${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // 4. 创建支付订单记录
    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .insert({
        order_no: orderNo,
        user_id: user.id,
        amount,
        currency: currency || 'CNY',
        subject,
        description,
        payment_method: paymentMethod,
        payment_status: 'pending',
        business_type: businessType,
        business_id: businessId,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // 5. 根据支付方式创建支付
    let paymentData: any = {}

    if (paymentMethod === 'stripe') {
      // Stripe支付
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
        apiVersion: '2023-10-16',
      })

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe使用分为单位
        currency: currency || 'cny',
        metadata: {
          order_no: orderNo,
          user_id: user.id,
        },
        description: subject,
      })

      paymentData = {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
      }

      // 更新订单的第三方交易号
      await supabase
        .from('payment_orders')
        .update({ transaction_id: paymentIntent.id })
        .eq('id', order.id)

    } else if (paymentMethod === 'mock') {
      // 模拟支付（用于开发测试）
      paymentData = {
        mock: true,
        order_no: orderNo,
        amount,
        currency,
      }
    } else {
      throw new Error('不支持的支付方式')
    }

    // 6. 返回支付信息
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          order_no: orderNo,
          order_id: order.id,
          amount,
          currency,
          payment_method: paymentMethod,
          payment_data: paymentData,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('创建支付订单失败:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

#### 2. 创建Supabase Edge Function：支付回调

```typescript
// supabase/functions/payment-callback/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()

    // 1. 验证Stripe签名
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)

    // 2. 创建Supabase客户端（使用service_role权限）
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. 记录回调日志
    await supabase.from('payment_callbacks').insert({
      order_no: event.data.object.metadata?.order_no || '',
      payment_method: 'stripe',
      callback_data: event,
      is_verified: true,
    })

    // 4. 处理不同的事件类型
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      const orderNo = paymentIntent.metadata.order_no

      // 5. 更新订单状态
      const { data: order, error: updateError } = await supabase
        .from('payment_orders')
        .update({
          payment_status: 'paid',
          payment_time: new Date().toISOString(),
          transaction_id: paymentIntent.id,
          payment_data: paymentIntent,
          updated_at: new Date().toISOString(),
        })
        .eq('order_no', orderNo)
        .select()
        .single()

      if (updateError) throw updateError

      // 6. 处理业务逻辑
      if (order.business_type === 'membership') {
        // 开通会员
        await supabase
          .from('dealerships')
          .update({
            membership_status: 'active',
            membership_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('id', order.dealership_id)
      }

      // 7. 标记回调已处理
      await supabase
        .from('payment_callbacks')
        .update({ is_processed: true })
        .eq('order_no', orderNo)
        .eq('is_processed', false)

      console.log('支付成功，订单号:', orderNo)
    }

    // 8. 返回成功响应
    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('处理支付回调失败:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

#### 3. 创建Supabase Edge Function：查询支付状态

```typescript
// supabase/functions/query-payment/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. 获取订单号
    const url = new URL(req.url)
    const orderNo = url.searchParams.get('order_no')

    if (!orderNo) {
      throw new Error('缺少订单号')
    }

    // 2. 验证用户身份
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('未授权')
    }

    // 3. 查询订单
    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_no', orderNo)
      .eq('user_id', user.id)
      .single()

    if (orderError) throw orderError

    // 4. 返回订单信息
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          order_no: order.order_no,
          amount: order.amount,
          currency: order.currency,
          subject: order.subject,
          payment_status: order.payment_status,
          payment_time: order.payment_time,
          payment_method: order.payment_method,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('查询支付状态失败:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

### 前端实现

#### 1. 创建支付API封装

```typescript
// src/lib/payment.ts

import { supabase } from '@/db/supabase'

export interface CreatePaymentParams {
  amount: number
  currency?: string
  subject: string
  description?: string
  businessType: string
  businessId?: string
  paymentMethod: 'stripe' | 'mock'
}

export interface PaymentOrder {
  order_no: string
  order_id: string
  amount: number
  currency: string
  payment_method: string
  payment_data: any
}

/**
 * 创建支付订单
 */
export async function createPayment(params: CreatePaymentParams): Promise<PaymentOrder> {
  const { data, error } = await supabase.functions.invoke('create-payment', {
    body: params,
  })

  if (error) throw error
  if (!data.success) throw new Error(data.error)

  return data.data
}

/**
 * 查询支付状态
 */
export async function queryPaymentStatus(orderNo: string) {
  const { data, error } = await supabase.functions.invoke('query-payment', {
    method: 'GET',
    body: { order_no: orderNo },
  })

  if (error) throw error
  if (!data.success) throw new Error(data.error)

  return data.data
}

/**
 * 模拟支付（用于开发测试）
 */
export async function mockPayment(orderNo: string): Promise<boolean> {
  // 模拟支付延迟
  await new Promise(resolve => setTimeout(resolve, 2000))

  // 模拟支付成功（90%成功率）
  const success = Math.random() > 0.1

  if (success) {
    // 这里应该调用后端接口更新订单状态
    // 实际项目中，这个操作应该在后端完成
    console.log('模拟支付成功:', orderNo)
    return true
  } else {
    throw new Error('模拟支付失败')
  }
}
```

#### 2. 创建Stripe支付组件

```typescript
// src/components/payment/StripePayment.tsx

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// 加载Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

interface StripePaymentFormProps {
  clientSecret: string
  amount: number
  currency: string
  onSuccess: () => void
  onError: (error: string) => void
}

function StripePaymentForm({ clientSecret, amount, currency, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        onError(error.message || '支付失败')
        toast.error(error.message || '支付失败')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess()
        toast.success('支付成功！')
      }
    } catch (err: any) {
      onError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          支付金额：
          <span className="text-2xl font-bold text-foreground ml-2">
            {currency === 'CNY' ? '¥' : '$'}
            {amount.toFixed(2)}
          </span>
        </div>
      </div>

      <PaymentElement />

      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            处理中...
          </>
        ) : (
          `支付 ${currency === 'CNY' ? '¥' : '$'}${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  )
}

interface StripePaymentProps {
  clientSecret: string
  amount: number
  currency: string
  subject: string
  onSuccess: () => void
  onError: (error: string) => void
}

export default function StripePayment({
  clientSecret,
  amount,
  currency,
  subject,
  onSuccess,
  onError,
}: StripePaymentProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>完成支付</CardTitle>
        <CardDescription>{subject}</CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={options}>
          <StripePaymentForm
            clientSecret={clientSecret}
            amount={amount}
            currency={currency}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      </CardContent>
    </Card>
  )
}
```

#### 3. 创建模拟支付组件

```typescript
// src/components/payment/MockPayment.tsx

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { mockPayment } from '@/lib/payment'

interface MockPaymentProps {
  orderNo: string
  amount: number
  currency: string
  subject: string
  onSuccess: () => void
  onError: (error: string) => void
}

export default function MockPayment({
  orderNo,
  amount,
  currency,
  subject,
  onSuccess,
  onError,
}: MockPaymentProps) {
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')

  const handlePay = async () => {
    if (!password) {
      toast.error('请输入支付密码')
      return
    }

    setLoading(true)

    try {
      // 模拟支付
      await mockPayment(orderNo)
      toast.success('支付成功！')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || '支付失败')
      onError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          模拟支付
        </CardTitle>
        <CardDescription>{subject}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            支付金额：
            <span className="text-2xl font-bold text-foreground ml-2">
              {currency === 'CNY' ? '¥' : '$'}
              {amount.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">支付密码</Label>
          <Input
            id="password"
            type="password"
            placeholder="输入任意6位数字"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={6}
          />
          <p className="text-xs text-muted-foreground">
            这是模拟支付，输入任意6位数字即可
          </p>
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
          <p className="font-semibold">💡 模拟支付说明：</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>这是开发测试用的模拟支付</li>
            <li>输入任意6位数字作为密码</li>
            <li>90%概率支付成功，10%概率失败</li>
            <li>不会产生真实扣款</li>
          </ul>
        </div>

        <Button
          onClick={handlePay}
          disabled={loading || password.length !== 6}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              处理中...
            </>
          ) : (
            `确认支付 ${currency === 'CNY' ? '¥' : '$'}${amount.toFixed(2)}`
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
```

#### 4. 创建支付页面

```typescript
// src/pages/Payment.tsx

import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { createPayment, queryPaymentStatus } from '@/lib/payment'
import StripePayment from '@/components/payment/StripePayment'
import MockPayment from '@/components/payment/MockPayment'

export default function Payment() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // 从URL获取支付参数
  const amount = Number.parseFloat(searchParams.get('amount') || '0')
  const subject = searchParams.get('subject') || '订单支付'
  const businessType = searchParams.get('type') || 'membership'
  const businessId = searchParams.get('id') || undefined

  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mock'>('mock')
  const [orderData, setOrderData] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending')

  // 创建支付订单
  const handleCreatePayment = async (method: 'stripe' | 'mock') => {
    setLoading(true)
    setPaymentMethod(method)

    try {
      const order = await createPayment({
        amount,
        currency: 'CNY',
        subject,
        description: `${subject} - ${amount}元`,
        businessType,
        businessId,
        paymentMethod: method,
      })

      setOrderData(order)
      toast.success('订单创建成功')
    } catch (err: any) {
      toast.error(err.message || '创建订单失败')
    } finally {
      setLoading(false)
    }
  }

  // 支付成功回调
  const handlePaymentSuccess = async () => {
    setPaymentStatus('success')

    // 等待一下，让回调处理完成
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 查询最终状态
    if (orderData) {
      try {
        const status = await queryPaymentStatus(orderData.order_no)
        if (status.payment_status === 'paid') {
          toast.success('支付成功！')
          setTimeout(() => {
            navigate('/')
          }, 2000)
        }
      } catch (err) {
        console.error('查询支付状态失败:', err)
      }
    }
  }

  // 支付失败回调
  const handlePaymentError = (error: string) => {
    setPaymentStatus('failed')
    toast.error(error)
  }

  // 如果没有金额，返回首页
  if (!amount || amount <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>参数错误</CardTitle>
            <CardDescription>缺少支付金额</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 支付成功页面
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <CardTitle>支付成功！</CardTitle>
              <CardDescription>您的支付已完成</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">订单号：</span>
                <span className="font-mono">{orderData?.order_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">支付金额：</span>
                <span className="font-bold">¥{amount.toFixed(2)}</span>
              </div>
            </div>
            <Button onClick={() => navigate('/')} className="w-full">
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 支付失败页面
  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-16 w-16 text-red-500" />
              <CardTitle>支付失败</CardTitle>
              <CardDescription>请重试或联系客服</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setPaymentStatus('pending')} className="w-full">
              重新支付
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 支付页面
  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>

        {/* 订单信息 */}
        <Card>
          <CardHeader>
            <CardTitle>订单信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">商品名称：</span>
              <span>{subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">支付金额：</span>
              <span className="text-2xl font-bold text-primary">¥{amount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* 支付方式选择 */}
        {!orderData && (
          <Card>
            <CardHeader>
              <CardTitle>选择支付方式</CardTitle>
              <CardDescription>请选择您的支付方式</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="mock" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mock">模拟支付</TabsTrigger>
                  <TabsTrigger value="stripe">Stripe支付</TabsTrigger>
                </TabsList>

                <TabsContent value="mock" className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                    <p className="font-semibold">💡 模拟支付</p>
                    <p className="text-muted-foreground">
                      用于开发测试，不会产生真实扣款
                    </p>
                  </div>
                  <Button
                    onClick={() => handleCreatePayment('mock')}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        创建订单中...
                      </>
                    ) : (
                      '使用模拟支付'
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="stripe" className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                    <p className="font-semibold">💳 Stripe支付</p>
                    <p className="text-muted-foreground">
                      支持信用卡、借记卡等多种支付方式
                    </p>
                  </div>
                  <Button
                    onClick={() => handleCreatePayment('stripe')}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        创建订单中...
                      </>
                    ) : (
                      '使用Stripe支付'
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* 支付组件 */}
        {orderData && (
          <div>
            {paymentMethod === 'stripe' && orderData.payment_data.client_secret && (
              <StripePayment
                clientSecret={orderData.payment_data.client_secret}
                amount={amount}
                currency="CNY"
                subject={subject}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}

            {paymentMethod === 'mock' && (
              <MockPayment
                orderNo={orderData.order_no}
                amount={amount}
                currency="CNY"
                subject={subject}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 🧪 测试方法

### 1. 模拟支付测试

```bash
# 1. 启动开发服务器
npm run dev

# 2. 访问支付页面
http://localhost:5173/payment?amount=99.00&subject=会员充值&type=membership

# 3. 选择"模拟支付"
# 4. 输入任意6位数字作为密码
# 5. 点击"确认支付"
# 6. 查看支付结果
```

### 2. Stripe测试支付

```bash
# 1. 注册Stripe测试账号
https://dashboard.stripe.com/register

# 2. 获取测试密钥
# 进入Dashboard > Developers > API keys
# 复制Publishable key和Secret key

# 3. 配置环境变量
# .env文件中添加：
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# 4. 部署Edge Functions
supabase functions deploy create-payment
supabase functions deploy payment-callback
supabase functions deploy query-payment

# 5. 配置Stripe Webhook
# Dashboard > Developers > Webhooks
# 添加endpoint: https://your-project.supabase.co/functions/v1/payment-callback
# 选择事件: payment_intent.succeeded

# 6. 测试支付
# 访问支付页面，选择"Stripe支付"
# 使用测试卡号：4242 4242 4242 4242
# 过期日期：任意未来日期
# CVC：任意3位数字
# 邮编：任意5位数字
```

### 3. 测试卡号

Stripe提供的测试卡号：

```
成功支付：
4242 4242 4242 4242  (Visa)
5555 5555 5555 4444  (Mastercard)

需要3D验证：
4000 0027 6000 3184

支付失败：
4000 0000 0000 0002  (卡被拒绝)
4000 0000 0000 9995  (余额不足)
```

---

## 🔒 安全注意事项

### 1. 密钥管理

```bash
# ❌ 错误：密钥写在代码里
const apiKey = 'sk_live_xxxxx'

# ✅ 正确：使用环境变量
const apiKey = process.env.STRIPE_SECRET_KEY
```

### 2. 金额验证

```typescript
// ❌ 错误：信任前端传来的金额
app.post('/create-payment', (req, res) => {
  const { amount } = req.body  // 危险！用户可以修改
  // ...
})

// ✅ 正确：后端计算金额
app.post('/create-payment', (req, res) => {
  const { productId } = req.body
  const product = getProduct(productId)
  const amount = product.price  // 从数据库获取
  // ...
})
```

### 3. 签名验证

```typescript
// ✅ 必须验证回调签名
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
)
```

### 4. 幂等性处理

```typescript
// ✅ 防止重复处理
const { data: existing } = await supabase
  .from('payment_orders')
  .select('*')
  .eq('transaction_id', paymentIntent.id)
  .single()

if (existing && existing.payment_status === 'paid') {
  // 已经处理过，直接返回
  return
}
```

### 5. HTTPS要求

```bash
# ❌ 错误：使用HTTP
http://your-domain.com/payment

# ✅ 正确：使用HTTPS
https://your-domain.com/payment
```

---

## ❓ 常见问题

### Q1: 如何申请微信/支付宝商户号？

**A:** 需要以下材料：
1. 营业执照
2. 法人身份证
3. 银行开户许可证
4. 经营场所照片
5. 申请流程：
   - 微信支付：https://pay.weixin.qq.com/
   - 支付宝：https://open.alipay.com/

### Q2: 支付回调没有收到怎么办？

**A:** 检查以下几点：
1. 回调URL是否公网可访问
2. 是否使用HTTPS
3. 是否正确配置了Webhook
4. 查看支付平台的Webhook日志
5. 检查服务器防火墙设置

### Q3: 如何测试支付回调？

**A:** 使用以下方法：
1. 使用ngrok等工具暴露本地服务
2. 使用Stripe CLI测试Webhook
3. 使用Postman模拟回调请求
4. 查看支付平台的测试工具

### Q4: 支付金额单位是什么？

**A:** 不同平台不同：
- Stripe：分（cents），需要乘以100
- 微信/支付宝：分，需要乘以100
- PayPal：元（dollars）

### Q5: 如何处理退款？

**A:** 调用退款API：
```typescript
const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  amount: refundAmount,  // 可以部分退款
})
```

### Q6: 生产环境需要注意什么？

**A:** 
1. 使用生产环境密钥
2. 配置正确的回调URL
3. 启用日志记录
4. 设置告警监控
5. 定期对账
6. 备份支付数据

---

## 📚 参考资料

### 官方文档

- **Stripe**: https://stripe.com/docs
- **微信支付**: https://pay.weixin.qq.com/wiki/doc/api/index.html
- **支付宝**: https://open.alipay.com/docs/
- **PayPal**: https://developer.paypal.com/

### 推荐阅读

- 《支付系统设计与实现》
- 《互联网支付安全》
- Stripe官方博客
- 支付宝技术博客

---

## 🎓 学习路径

### 初级（1-2周）

1. 理解支付流程
2. 学习Stripe基础API
3. 实现模拟支付
4. 完成简单的支付页面

### 中级（2-4周）

1. 实现真实支付
2. 处理支付回调
3. 实现订单管理
4. 添加退款功能

### 高级（1-2月）

1. 接入微信/支付宝
2. 实现分账功能
3. 对账系统
4. 风控系统

---

## 🎉 总结

通过本教程，您已经学会了：

1. ✅ 支付的基本原理和流程
2. ✅ 如何创建支付订单
3. ✅ 如何处理支付回调
4. ✅ 如何实现前端支付界面
5. ✅ 如何测试支付功能
6. ✅ 支付安全的注意事项

**下一步建议：**

1. 实践模拟支付
2. 注册Stripe测试账号
3. 完成真实支付测试
4. 学习微信/支付宝接入
5. 实现完整的支付系统

**祝您学习愉快！** 🎊

如有问题，欢迎随时咨询！
