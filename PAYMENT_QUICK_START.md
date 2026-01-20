# 💰 线上支付快速实践指南

## 🎯 10分钟快速上手

### 第一步：理解支付流程（2分钟）

```
用户 → 创建订单 → 调起支付 → 完成支付 → 回调通知 → 更新状态
```

### 第二步：选择支付方式（1分钟）

**开发测试阶段：**
- ✅ 使用模拟支付（无需注册，立即可用）

**生产环境：**
- 🌍 国际业务：Stripe（推荐，申请简单）
- 🇨🇳 国内业务：微信支付/支付宝（需要企业资质）

### 第三步：创建数据库表（2分钟）

```sql
-- 复制并执行以下SQL
CREATE TABLE payment_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_no VARCHAR(64) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'CNY',
  subject VARCHAR(256) NOT NULL,
  payment_method VARCHAR(32),
  payment_status VARCHAR(32) DEFAULT 'pending',
  payment_time TIMESTAMP,
  transaction_id VARCHAR(128),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 第四步：部署Edge Functions（3分钟）

```bash
# 1. 创建Edge Function文件
# 复制PAYMENT_TUTORIAL.md中的代码到：
# supabase/functions/create-payment/index.ts
# supabase/functions/payment-callback/index.ts
# supabase/functions/query-payment/index.ts

# 2. 部署
supabase functions deploy create-payment
supabase functions deploy payment-callback
supabase functions deploy query-payment
```

### 第五步：添加前端代码（2分钟）

```bash
# 1. 安装依赖
npm install @stripe/stripe-js @stripe/react-stripe-js stripe

# 2. 复制组件代码
# 从PAYMENT_TUTORIAL.md复制以下文件：
# - src/lib/payment.ts
# - src/components/payment/StripePayment.tsx
# - src/components/payment/MockPayment.tsx
# - src/pages/Payment.tsx

# 3. 添加路由
# 在routes.tsx中添加支付页面路由
```

### 第六步：测试（2分钟）

```bash
# 1. 启动开发服务器
npm run dev

# 2. 访问支付页面
http://localhost:5173/payment?amount=99.00&subject=测试支付&type=test

# 3. 选择"模拟支付"
# 4. 输入6位数字密码
# 5. 完成支付测试
```

---

## 🚀 三种支付方式对比

| 特性 | 模拟支付 | Stripe | 微信/支付宝 |
|------|---------|--------|------------|
| 申请难度 | ⭐ 无需申请 | ⭐⭐ 简单 | ⭐⭐⭐⭐⭐ 复杂 |
| 开发难度 | ⭐ 简单 | ⭐⭐ 中等 | ⭐⭐⭐⭐ 较难 |
| 适用场景 | 开发测试 | 国际业务 | 国内业务 |
| 费率 | 免费 | 2.9%+$0.30 | 0.6% |
| 到账时间 | - | T+2 | T+1 |
| 需要资质 | ❌ | ❌ | ✅ 企业 |

---

## 📝 核心代码示例

### 1. 创建支付订单

```typescript
import { createPayment } from '@/lib/payment'

// 创建支付订单
const order = await createPayment({
  amount: 99.00,              // 支付金额
  currency: 'CNY',            // 货币类型
  subject: '会员充值',         // 订单标题
  description: '年度会员',     // 订单描述
  businessType: 'membership',  // 业务类型
  paymentMethod: 'mock',       // 支付方式：mock/stripe
})

console.log('订单号:', order.order_no)
console.log('支付数据:', order.payment_data)
```

### 2. 查询支付状态

```typescript
import { queryPaymentStatus } from '@/lib/payment'

// 查询订单状态
const status = await queryPaymentStatus('PAY1234567890')

console.log('支付状态:', status.payment_status)  // pending/paid/failed
console.log('支付时间:', status.payment_time)
```

### 3. 处理支付回调

```typescript
// Edge Function中处理回调
if (event.type === 'payment_intent.succeeded') {
  // 1. 更新订单状态
  await supabase
    .from('payment_orders')
    .update({
      payment_status: 'paid',
      payment_time: new Date().toISOString(),
    })
    .eq('order_no', orderNo)

  // 2. 处理业务逻辑
  if (order.business_type === 'membership') {
    // 开通会员
    await activateMembership(order.user_id)
  }
}
```

---

## 🎨 支付页面示例

### 简单版（最小实现）

```typescript
import { useState } from 'react'
import { createPayment, mockPayment } from '@/lib/payment'
import { Button } from '@/components/ui/button'

export default function SimplePayment() {
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)
    try {
      // 1. 创建订单
      const order = await createPayment({
        amount: 99.00,
        subject: '测试支付',
        businessType: 'test',
        paymentMethod: 'mock',
      })

      // 2. 模拟支付
      await mockPayment(order.order_no)

      // 3. 支付成功
      alert('支付成功！')
    } catch (err) {
      alert('支付失败：' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">支付测试</h1>
      <p className="mb-4">支付金额：¥99.00</p>
      <Button onClick={handlePay} disabled={loading}>
        {loading ? '处理中...' : '立即支付'}
      </Button>
    </div>
  )
}
```

### 完整版（包含UI）

参考 `PAYMENT_TUTORIAL.md` 中的 `Payment.tsx` 组件。

---

## 🔧 常用配置

### 环境变量配置

```env
# .env文件

# Stripe配置（可选，用于真实支付）
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# 微信支付配置（可选）
WECHAT_APP_ID=wxxxxxxxxxxx
WECHAT_MCH_ID=1234567890
WECHAT_API_KEY=xxxxxxxxxxxxxxxx

# 支付宝配置（可选）
ALIPAY_APP_ID=2021xxxxxxxxxxxxx
ALIPAY_PRIVATE_KEY=MIIEvQIBADANBgkqhkiG9w0...
ALIPAY_PUBLIC_KEY=MIIBIjANBgkqhkiG9w0BAQE...
```

### Supabase RLS策略

```sql
-- 用户只能查看自己的订单
CREATE POLICY "用户查看自己的订单"
ON payment_orders FOR SELECT
USING (auth.uid() = user_id);

-- 用户只能创建自己的订单
CREATE POLICY "用户创建订单"
ON payment_orders FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## 🐛 调试技巧

### 1. 查看支付订单

```sql
-- 查询所有订单
SELECT * FROM payment_orders ORDER BY created_at DESC LIMIT 10;

-- 查询待支付订单
SELECT * FROM payment_orders WHERE payment_status = 'pending';

-- 查询已支付订单
SELECT * FROM payment_orders WHERE payment_status = 'paid';
```

### 2. 查看回调日志

```sql
-- 查询回调记录
SELECT * FROM payment_callbacks ORDER BY created_at DESC LIMIT 10;

-- 查询未处理的回调
SELECT * FROM payment_callbacks WHERE is_processed = false;
```

### 3. 测试回调

```bash
# 使用curl测试回调接口
curl -X POST https://your-project.supabase.co/functions/v1/payment-callback \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test_123",
        "metadata": {
          "order_no": "PAY1234567890"
        }
      }
    }
  }'
```

---

## 📊 支付流程图

```
┌─────────────────────────────────────────────────────────────┐
│                     支付完整流程                              │
└─────────────────────────────────────────────────────────────┘

1. 用户点击"支付"
   ↓
2. 前端调用 createPayment()
   ↓
3. 后端创建订单记录（status: pending）
   ↓
4. 后端调用支付平台API
   ↓
5. 返回支付参数给前端
   ↓
6. 前端调起支付界面
   ↓
7. 用户完成支付
   ↓
8. 支付平台异步通知后端（Webhook）
   ↓
9. 后端验证签名
   ↓
10. 后端更新订单状态（status: paid）
    ↓
11. 后端处理业务逻辑（开通会员、发货等）
    ↓
12. 前端轮询查询订单状态
    ↓
13. 显示支付结果
```

---

## ⚠️ 重要提醒

### 安全注意事项

1. **密钥保护**
   - ❌ 不要把密钥写在代码里
   - ❌ 不要把密钥提交到Git
   - ✅ 使用环境变量
   - ✅ 使用.env.local（不提交到Git）

2. **金额验证**
   - ❌ 不要信任前端传来的金额
   - ✅ 后端从数据库获取金额
   - ✅ 回调时再次验证金额

3. **签名验证**
   - ✅ 必须验证回调签名
   - ✅ 防止伪造回调

4. **幂等性**
   - ✅ 防止重复处理
   - ✅ 使用transaction_id去重

5. **HTTPS**
   - ✅ 生产环境必须使用HTTPS
   - ✅ 回调URL必须是HTTPS

### 测试注意事项

1. **使用测试环境**
   - 开发阶段使用测试密钥
   - 不要在测试环境使用真实银行卡

2. **测试用例**
   - ✅ 测试支付成功
   - ✅ 测试支付失败
   - ✅ 测试网络超时
   - ✅ 测试重复支付

3. **日志记录**
   - ✅ 记录所有支付请求
   - ✅ 记录所有回调
   - ✅ 记录错误信息

---

## 🎓 学习资源

### 视频教程

- [Stripe支付集成教程](https://www.youtube.com/watch?v=1r-F3FIONl8)
- [微信支付开发教程](https://www.bilibili.com/video/BV1xx411c7mD/)

### 文档

- [Stripe官方文档](https://stripe.com/docs)
- [微信支付开发文档](https://pay.weixin.qq.com/wiki/doc/api/index.html)
- [支付宝开发文档](https://open.alipay.com/docs/)

### 示例项目

- [Stripe React示例](https://github.com/stripe-samples/accept-a-payment)
- [Next.js支付示例](https://github.com/vercel/next.js/tree/canary/examples/with-stripe-typescript)

---

## 💡 最佳实践

### 1. 订单号生成

```typescript
// 推荐格式：前缀 + 时间戳 + 随机数
function generateOrderNo() {
  const prefix = 'PAY'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

// 示例：PAY1705747200000ABC123DEF
```

### 2. 金额处理

```typescript
// 前端显示：保留2位小数
const displayAmount = (amount: number) => {
  return `¥${amount.toFixed(2)}`
}

// 后端计算：使用整数（分）
const amountInCents = Math.round(amount * 100)

// Stripe支付：转换为分
const stripeAmount = Math.round(amount * 100)
```

### 3. 状态管理

```typescript
// 订单状态枚举
enum PaymentStatus {
  PENDING = 'pending',    // 待支付
  PAID = 'paid',          // 已支付
  FAILED = 'failed',      // 支付失败
  REFUNDED = 'refunded',  // 已退款
  CANCELLED = 'cancelled' // 已取消
}
```

### 4. 错误处理

```typescript
try {
  const order = await createPayment(params)
  return order
} catch (error) {
  // 记录错误日志
  console.error('创建支付失败:', error)
  
  // 返回友好的错误信息
  if (error.message.includes('insufficient')) {
    throw new Error('余额不足')
  } else if (error.message.includes('network')) {
    throw new Error('网络错误，请重试')
  } else {
    throw new Error('支付失败，请联系客服')
  }
}
```

---

## 🎉 完成！

现在您已经掌握了线上支付的核心知识和实践方法！

**下一步：**

1. ✅ 完成模拟支付测试
2. ✅ 注册Stripe测试账号
3. ✅ 实现真实支付
4. ✅ 学习微信/支付宝接入
5. ✅ 上线生产环境

**需要帮助？**

- 📖 查看完整教程：`PAYMENT_TUTORIAL.md`
- 💬 加入开发者社区
- 📧 联系技术支持

**祝您开发顺利！** 🚀
