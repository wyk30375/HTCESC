# 线上支付实现方案

## 📋 概述

当前系统已实现扫码支付的基础框架，使用模拟支付进行测试。要实现真正的线上支付，需要集成第三方支付平台（微信支付、支付宝等）。

---

## 💳 支付平台选择

### 1. 微信支付 ⭐⭐⭐⭐⭐ 强烈推荐

**优势**：
- ✅ 用户覆盖率最高（12亿+用户）
- ✅ 支付体验最好（微信内一键支付）
- ✅ 手续费较低（0.6%）
- ✅ 到账快（T+1）
- ✅ 支持多种支付方式（扫码、H5、小程序、APP）

**劣势**：
- ⚠️ 需要企业资质（营业执照、对公账户）
- ⚠️ 审核较严格（1-3个工作日）
- ⚠️ 需要ICP备案

**费用**：
- 开通费用：免费
- 手续费：0.6%/笔
- 提现费用：免费（到对公账户）

**适用场景**：
- 面向C端用户
- 需要微信生态集成
- 追求最佳用户体验

---

### 2. 支付宝 ⭐⭐⭐⭐⭐ 强烈推荐

**优势**：
- ✅ 用户覆盖率高（10亿+用户）
- ✅ 支付体验好
- ✅ 手续费较低（0.6%）
- ✅ 到账快（T+1）
- ✅ 支持多种支付方式（扫码、H5、APP）
- ✅ 技术文档完善

**劣势**：
- ⚠️ 需要企业资质
- ⚠️ 审核较严格

**费用**：
- 开通费用：免费
- 手续费：0.6%/笔
- 提现费用：免费（到对公账户）

**适用场景**：
- 面向C端用户
- 需要支付宝生态集成
- 追求稳定可靠

---

### 3. 聚合支付平台 ⭐⭐⭐⭐ 推荐

**代表平台**：
- Ping++（国内领先）
- BeeCloud（易用性好）
- PayJS（个人可用）
- 虎皮椒（个人可用）

**优势**：
- ✅ 一次集成，支持多种支付方式
- ✅ 技术门槛低
- ✅ 开发效率高
- ✅ 部分支持个人开发者

**劣势**：
- ⚠️ 手续费较高（1%-3%）
- ⚠️ 依赖第三方平台
- ⚠️ 部分平台稳定性一般

**费用**：
- 开通费用：免费-¥1,000
- 手续费：1%-3%/笔
- 月费：¥0-¥500

**适用场景**：
- 快速上线
- 个人开发者
- 多支付方式需求

---

### 4. 银联支付 ⭐⭐⭐

**优势**：
- ✅ 官方背景，安全可靠
- ✅ 支持所有银行卡
- ✅ 适合大额支付

**劣势**：
- ⚠️ 用户体验一般
- ⚠️ 手续费较高（1%-2%）
- ⚠️ 技术文档复杂

**费用**：
- 开通费用：免费
- 手续费：1%-2%/笔

**适用场景**：
- B端企业支付
- 大额交易
- 需要银行卡支付

---

## 🏆 推荐方案

### 方案1：微信支付 + 支付宝（最佳）

**适用场景**：正规企业运营

**优势**：
- 覆盖95%以上用户
- 手续费最低
- 用户体验最好
- 品牌形象好

**实施成本**：
- 开发时间：3-5天
- 开发成本：¥5,000-10,000
- 手续费：0.6%

---

### 方案2：聚合支付平台（快速上线）

**适用场景**：快速验证、个人开发者

**优势**：
- 快速集成（1-2天）
- 技术门槛低
- 支持多种支付方式

**实施成本**：
- 开发时间：1-2天
- 开发成本：¥2,000-5,000
- 手续费：1%-3%

---

## 🔧 微信支付集成方案（详细）

### 第一步：注册微信支付商户

#### 1.1 准备资料

**企业资质**：
- 营业执照（扫描件）
- 法人身份证（正反面）
- 对公账户信息
- 经营场所照片
- ICP备案号

**个人资质**（小微商户）：
- 身份证（正反面）
- 银行卡信息
- 经营场所照片
- 手持身份证照片

#### 1.2 注册流程

1. 访问 [微信支付商户平台](https://pay.weixin.qq.com/)
2. 点击"立即注册"
3. 选择"企业"或"小微商户"
4. 填写基本信息
5. 上传资质材料
6. 等待审核（1-3个工作日）
7. 签署协议
8. 获取商户号和API密钥

#### 1.3 获取密钥

**商户号（mch_id）**：
- 审核通过后自动分配
- 格式：10位数字

**API密钥（api_key）**：
- 登录商户平台
- 账户中心 → API安全 → 设置API密钥
- 32位字符串，妥善保管

**API证书**：
- 账户中心 → API安全 → 下载证书
- 用于退款等敏感操作

---

### 第二步：安装依赖

```bash
# 安装微信支付SDK
npm install wechatpay-node-v3

# 或使用传统SDK
npm install wechatpay-axios-plugin
```

---

### 第三步：创建Edge Function

**文件**：`supabase/functions/wechat-pay/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Payment from 'https://esm.sh/wechatpay-node-v3@1.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 初始化微信支付
const payment = new Payment({
  appid: Deno.env.get('WECHAT_APPID')!,
  mchid: Deno.env.get('WECHAT_MCHID')!,
  private_key: Deno.env.get('WECHAT_PRIVATE_KEY')!,
  serial_no: Deno.env.get('WECHAT_SERIAL_NO')!,
  apiv3_private_key: Deno.env.get('WECHAT_APIV3_KEY')!,
});

serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();

    // 创建订单
    if (action === 'create') {
      const { order_no, amount, description } = data;

      // 调用微信支付Native下单API
      const result = await payment.native({
        description,
        out_trade_no: order_no,
        amount: {
          total: Math.round(amount * 100), // 转换为分
        },
        notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/wechat-pay-notify`,
      });

      return new Response(
        JSON.stringify({
          success: true,
          qr_code: result.code_url, // 二维码链接
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 查询订单
    if (action === 'query') {
      const { order_no } = data;

      const result = await payment.query({
        out_trade_no: order_no,
      });

      return new Response(
        JSON.stringify({
          success: true,
          status: result.trade_state, // SUCCESS, REFUND, NOTPAY, CLOSED, REVOKED, USERPAYING, PAYERROR
          transaction_id: result.transaction_id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 关闭订单
    if (action === 'close') {
      const { order_no } = data;

      await payment.close({
        out_trade_no: order_no,
      });

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('微信支付错误:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

---

### 第四步：创建支付回调处理

**文件**：`supabase/functions/wechat-pay-notify/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Payment from 'https://esm.sh/wechatpay-node-v3@1.0.0';

const payment = new Payment({
  appid: Deno.env.get('WECHAT_APPID')!,
  mchid: Deno.env.get('WECHAT_MCHID')!,
  private_key: Deno.env.get('WECHAT_PRIVATE_KEY')!,
  serial_no: Deno.env.get('WECHAT_SERIAL_NO')!,
  apiv3_private_key: Deno.env.get('WECHAT_APIV3_KEY')!,
});

serve(async (req) => {
  try {
    // 获取请求头和请求体
    const signature = req.headers.get('Wechatpay-Signature');
    const timestamp = req.headers.get('Wechatpay-Timestamp');
    const nonce = req.headers.get('Wechatpay-Nonce');
    const serial = req.headers.get('Wechatpay-Serial');
    const body = await req.text();

    // 验证签名
    const verified = payment.verifySignature({
      signature,
      timestamp,
      nonce,
      serial,
      body,
    });

    if (!verified) {
      console.error('签名验证失败');
      return new Response(
        JSON.stringify({ code: 'FAIL', message: '签名验证失败' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 解密通知数据
    const data = JSON.parse(body);
    const decrypted = payment.decipher(data.resource);
    const notification = JSON.parse(decrypted);

    console.log('支付通知:', notification);

    // 初始化Supabase客户端
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 更新订单状态
    const { out_trade_no, transaction_id, trade_state, amount } = notification;

    if (trade_state === 'SUCCESS') {
      // 1. 更新payment_orders表
      await supabase
        .from('payment_orders')
        .update({
          status: 'paid',
          transaction_id,
          paid_at: new Date().toISOString(),
        })
        .eq('order_no', out_trade_no);

      // 2. 查询订单信息
      const { data: order } = await supabase
        .from('payment_orders')
        .select('dealership_id, tier_id, amount')
        .eq('order_no', out_trade_no)
        .single();

      if (order) {
        // 3. 创建支付记录
        await supabase.from('membership_payments').insert({
          dealership_id: order.dealership_id,
          tier_id: order.tier_id,
          amount: order.amount,
          payment_method: 'wechat',
          transaction_id,
          status: 'completed',
        });

        // 4. 更新或创建会员记录
        const { data: existingMembership } = await supabase
          .from('dealership_memberships')
          .select('id, end_date')
          .eq('dealership_id', order.dealership_id)
          .eq('status', 'active')
          .single();

        const startDate = existingMembership?.end_date
          ? new Date(existingMembership.end_date)
          : new Date();
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);

        if (existingMembership) {
          // 续费
          await supabase
            .from('dealership_memberships')
            .update({
              tier_id: order.tier_id,
              end_date: endDate.toISOString(),
              is_trial: false,
            })
            .eq('id', existingMembership.id);
        } else {
          // 新开通
          await supabase.from('dealership_memberships').insert({
            dealership_id: order.dealership_id,
            tier_id: order.tier_id,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            is_trial: false,
            status: 'active',
          });
        }
      }
    }

    // 返回成功响应
    return new Response(
      JSON.stringify({ code: 'SUCCESS', message: '成功' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('处理支付通知失败:', error);
    return new Response(
      JSON.stringify({ code: 'FAIL', message: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
```

---

### 第五步：配置环境变量

**Supabase Dashboard → Settings → Edge Functions → Secrets**

```bash
# 微信支付配置
WECHAT_APPID=wx1234567890abcdef        # 微信公众号/小程序AppID
WECHAT_MCHID=1234567890                # 商户号
WECHAT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...  # 商户私钥
WECHAT_SERIAL_NO=1234567890ABCDEF      # 证书序列号
WECHAT_APIV3_KEY=32位字符串             # APIv3密钥
```

---

### 第六步：前端调用

**文件**：`src/db/paymentApi.ts`

```typescript
import { supabase } from './supabase';

// 创建微信支付订单
export async function createWechatPayOrder(params: {
  dealershipId: string;
  tierId: string;
  amount: number;
  description: string;
}) {
  // 1. 创建订单记录
  const orderNo = `WX${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  
  const { data: order, error: orderError } = await supabase
    .from('payment_orders')
    .insert({
      order_no: orderNo,
      dealership_id: params.dealershipId,
      tier_id: params.tierId,
      amount: params.amount,
      payment_method: 'wechat',
      status: 'pending',
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. 调用Edge Function创建微信支付订单
  const { data, error } = await supabase.functions.invoke('wechat-pay', {
    body: {
      action: 'create',
      data: {
        order_no: orderNo,
        amount: params.amount,
        description: params.description,
      },
    },
  });

  if (error) throw error;

  return {
    order_no: orderNo,
    qr_code: data.qr_code, // 二维码链接
  };
}

// 查询微信支付订单状态
export async function queryWechatPayOrder(orderNo: string) {
  const { data, error } = await supabase.functions.invoke('wechat-pay', {
    body: {
      action: 'query',
      data: { order_no: orderNo },
    },
  });

  if (error) throw error;

  // 同步更新本地订单状态
  if (data.status === 'SUCCESS') {
    await supabase
      .from('payment_orders')
      .update({ status: 'paid' })
      .eq('order_no', orderNo);
  }

  return {
    status: data.status === 'SUCCESS' ? 'paid' : 'pending',
    transaction_id: data.transaction_id,
  };
}
```

---

### 第七步：前端显示二维码

**文件**：`src/pages/MembershipCenter.tsx`

```typescript
import QRCode from 'qrcode';

// 在handleOpenPayment函数中
const handleOpenPayment = async (tier: MembershipTier) => {
  try {
    setPaymentLoading(true);
    setSelectedTier(tier);

    // 创建微信支付订单
    const order = await createWechatPayOrder({
      dealershipId: profile.dealership_id,
      tierId: tier.id,
      amount: tier.annual_fee,
      description: `${tier.tier_name}会员年费`,
    });

    // 生成二维码图片
    const qrCodeDataUrl = await QRCode.toDataURL(order.qr_code, {
      width: 300,
      margin: 2,
    });

    setPaymentOrder({
      ...order,
      qr_code_image: qrCodeDataUrl,
    });
    setPaymentDialogOpen(true);

    // 开始轮询订单状态
    startPaymentCheck(order.order_no);
  } catch (error) {
    console.error('创建支付订单失败:', error);
    toast.error('创建支付订单失败');
  } finally {
    setPaymentLoading(false);
  }
};

// 轮询检查支付状态
const startPaymentCheck = (orderNo: string) => {
  setCheckingPayment(true);

  const checkInterval = setInterval(async () => {
    try {
      const order = await queryWechatPayOrder(orderNo);

      if (order.status === 'paid') {
        clearInterval(checkInterval);
        setCheckingPayment(false);
        toast.success('支付成功！会员已开通');
        setPaymentDialogOpen(false);
        loadData(); // 重新加载数据
      }
    } catch (error) {
      console.error('检查支付状态失败:', error);
    }
  }, 3000); // 每3秒检查一次

  // 5分钟后停止检查
  setTimeout(() => {
    clearInterval(checkInterval);
    setCheckingPayment(false);
  }, 5 * 60 * 1000);
};
```

---

## 🔧 支付宝集成方案（详细）

### 第一步：注册支付宝商户

#### 1.1 准备资料

**企业资质**：
- 营业执照
- 法人身份证
- 对公账户信息
- 网站信息

#### 1.2 注册流程

1. 访问 [支付宝开放平台](https://open.alipay.com/)
2. 注册账号并登录
3. 创建应用（网页/移动应用）
4. 填写应用信息
5. 上传资质材料
6. 等待审核（1-3个工作日）
7. 签约"电脑网站支付"或"手机网站支付"
8. 获取APPID和密钥

#### 1.3 配置密钥

**生成RSA密钥**：
```bash
# 使用支付宝提供的密钥生成工具
# 下载地址：https://opendocs.alipay.com/common/02kipl

# 或使用OpenSSL生成
openssl genrsa -out app_private_key.pem 2048
openssl rsa -in app_private_key.pem -pubout -out app_public_key.pem
```

**配置密钥**：
1. 登录开放平台
2. 进入应用详情
3. 开发信息 → 接口加签方式 → 设置
4. 上传应用公钥
5. 获取支付宝公钥

---

### 第二步：创建Edge Function

**文件**：`supabase/functions/alipay/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import AlipaySdk from 'https://esm.sh/alipay-sdk@3.4.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 初始化支付宝SDK
const alipaySdk = new AlipaySdk({
  appId: Deno.env.get('ALIPAY_APPID')!,
  privateKey: Deno.env.get('ALIPAY_PRIVATE_KEY')!,
  alipayPublicKey: Deno.env.get('ALIPAY_PUBLIC_KEY')!,
  gateway: 'https://openapi.alipay.com/gateway.do',
  timeout: 5000,
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();

    // 创建订单
    if (action === 'create') {
      const { order_no, amount, description } = data;

      // 调用支付宝预下单API（扫码支付）
      const result = await alipaySdk.exec('alipay.trade.precreate', {
        bizContent: {
          out_trade_no: order_no,
          total_amount: amount.toFixed(2),
          subject: description,
          timeout_express: '5m',
        },
        notifyUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/alipay-notify`,
      });

      return new Response(
        JSON.stringify({
          success: true,
          qr_code: result.qrCode, // 二维码内容
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 查询订单
    if (action === 'query') {
      const { order_no } = data;

      const result = await alipaySdk.exec('alipay.trade.query', {
        bizContent: {
          out_trade_no: order_no,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          status: result.tradeStatus, // WAIT_BUYER_PAY, TRADE_SUCCESS, TRADE_CLOSED
          trade_no: result.tradeNo,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 关闭订单
    if (action === 'close') {
      const { order_no } = data;

      await alipaySdk.exec('alipay.trade.close', {
        bizContent: {
          out_trade_no: order_no,
        },
      });

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('支付宝错误:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

---

### 第三步：创建支付回调处理

**文件**：`supabase/functions/alipay-notify/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import AlipaySdk from 'https://esm.sh/alipay-sdk@3.4.0';

const alipaySdk = new AlipaySdk({
  appId: Deno.env.get('ALIPAY_APPID')!,
  privateKey: Deno.env.get('ALIPAY_PRIVATE_KEY')!,
  alipayPublicKey: Deno.env.get('ALIPAY_PUBLIC_KEY')!,
});

serve(async (req) => {
  try {
    // 获取POST参数
    const formData = await req.formData();
    const params: any = {};
    for (const [key, value] of formData.entries()) {
      params[key] = value;
    }

    console.log('支付宝通知:', params);

    // 验证签名
    const verified = alipaySdk.checkNotifySign(params);
    if (!verified) {
      console.error('签名验证失败');
      return new Response('fail', { status: 401 });
    }

    // 初始化Supabase客户端
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const {
      out_trade_no,
      trade_no,
      trade_status,
      total_amount,
    } = params;

    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      // 1. 更新payment_orders表
      await supabase
        .from('payment_orders')
        .update({
          status: 'paid',
          transaction_id: trade_no,
          paid_at: new Date().toISOString(),
        })
        .eq('order_no', out_trade_no);

      // 2. 查询订单信息
      const { data: order } = await supabase
        .from('payment_orders')
        .select('dealership_id, tier_id, amount')
        .eq('order_no', out_trade_no)
        .single();

      if (order) {
        // 3. 创建支付记录
        await supabase.from('membership_payments').insert({
          dealership_id: order.dealership_id,
          tier_id: order.tier_id,
          amount: parseFloat(total_amount),
          payment_method: 'alipay',
          transaction_id: trade_no,
          status: 'completed',
        });

        // 4. 更新或创建会员记录（同微信支付）
        // ... 省略，逻辑相同
      }
    }

    // 返回成功响应
    return new Response('success', { status: 200 });
  } catch (error) {
    console.error('处理支付通知失败:', error);
    return new Response('fail', { status: 500 });
  }
});
```

---

## 🔒 安全性保障

### 1. HTTPS强制

**必须使用HTTPS**：
- 所有支付相关请求必须使用HTTPS
- Supabase默认提供HTTPS
- 自定义域名需配置SSL证书

### 2. 签名验证

**微信支付**：
```typescript
// 验证回调签名
const verified = payment.verifySignature({
  signature,
  timestamp,
  nonce,
  serial,
  body,
});

if (!verified) {
  throw new Error('签名验证失败');
}
```

**支付宝**：
```typescript
// 验证回调签名
const verified = alipaySdk.checkNotifySign(params);

if (!verified) {
  throw new Error('签名验证失败');
}
```

### 3. 密钥管理

**存储位置**：
- ✅ Supabase Edge Functions Secrets
- ✅ 环境变量
- ❌ 代码中硬编码
- ❌ 前端代码

**访问控制**：
- 只有Edge Functions可以访问
- 使用SUPABASE_SERVICE_ROLE_KEY
- 不暴露给前端

### 4. 订单防重

**幂等性保证**：
```typescript
// 检查订单是否已处理
const { data: existingOrder } = await supabase
  .from('payment_orders')
  .select('status')
  .eq('order_no', out_trade_no)
  .single();

if (existingOrder?.status === 'paid') {
  console.log('订单已处理，跳过');
  return new Response('success', { status: 200 });
}
```

### 5. 金额校验

**验证支付金额**：
```typescript
// 查询订单金额
const { data: order } = await supabase
  .from('payment_orders')
  .select('amount')
  .eq('order_no', out_trade_no)
  .single();

// 验证金额是否一致
if (Math.abs(order.amount - parseFloat(total_amount)) > 0.01) {
  console.error('金额不匹配');
  throw new Error('金额不匹配');
}
```

### 6. 日志记录

**记录所有支付操作**：
```typescript
// 记录支付日志
await supabase.from('payment_logs').insert({
  order_no: out_trade_no,
  action: 'notify',
  request_data: JSON.stringify(params),
  response_data: JSON.stringify(result),
  created_at: new Date().toISOString(),
});
```

---

## 🧪 测试方法

### 1. 沙箱环境测试

**微信支付沙箱**：
- 访问 [微信支付沙箱](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=23_1)
- 获取沙箱密钥
- 修改gateway为沙箱地址
- 使用沙箱账号测试

**支付宝沙箱**：
- 访问 [支付宝沙箱](https://openhome.alipay.com/develop/sandbox/app)
- 获取沙箱APPID和密钥
- 下载沙箱钱包APP
- 使用沙箱账号测试

### 2. 本地测试

**使用ngrok暴露本地服务**：
```bash
# 安装ngrok
npm install -g ngrok

# 启动ngrok
ngrok http 54321

# 将ngrok URL配置为回调地址
https://xxxx.ngrok.io/functions/v1/wechat-pay-notify
```

### 3. 模拟支付

**保留模拟支付功能**：
```typescript
// 添加环境变量控制
const USE_MOCK_PAYMENT = Deno.env.get('USE_MOCK_PAYMENT') === 'true';

if (USE_MOCK_PAYMENT) {
  // 使用模拟支付
  return mockPayment(data);
} else {
  // 使用真实支付
  return realPayment(data);
}
```

---

## 📊 成本分析

### 微信支付 + 支付宝

| 项目 | 成本 | 说明 |
|------|------|------|
| 开发成本 | ¥5,000-10,000 | 3-5天开发时间 |
| 商户入驻 | ¥0 | 免费 |
| 手续费 | 0.6%/笔 | 按交易额收取 |
| 提现费用 | ¥0 | 到对公账户免费 |
| 年度费用 | ¥0 | 无年费 |

**示例计算**：
- 月交易额：¥10,000
- 月手续费：¥10,000 × 0.6% = ¥60
- 年手续费：¥60 × 12 = ¥720

---

### 聚合支付平台

| 项目 | 成本 | 说明 |
|------|------|------|
| 开发成本 | ¥2,000-5,000 | 1-2天开发时间 |
| 平台入驻 | ¥0-1,000 | 部分平台收费 |
| 手续费 | 1%-3%/笔 | 按交易额收取 |
| 提现费用 | ¥0-2/笔 | 部分平台收费 |
| 年度费用 | ¥0-6,000 | 部分平台收月费 |

**示例计算**：
- 月交易额：¥10,000
- 月手续费：¥10,000 × 2% = ¥200
- 年手续费：¥200 × 12 = ¥2,400

---

## 🚀 实施建议

### 阶段1：开发环境（1-2天）

1. 注册沙箱账号
2. 配置开发环境
3. 实现基本支付流程
4. 本地测试

### 阶段2：测试环境（2-3天）

1. 注册正式商户
2. 配置生产环境
3. 部署Edge Functions
4. 沙箱环境测试

### 阶段3：生产环境（1天）

1. 切换到生产密钥
2. 小额真实测试
3. 监控日志
4. 正式上线

---

## ❓ 常见问题

### Q1: 个人可以申请微信支付吗？

**A**: 可以，但有限制：
- 需要申请"小微商户"
- 需要提供经营场所照片
- 单笔限额较低（500元）
- 月交易额限制（10万元）

**建议**：
- 如果是正规运营，建议注册公司
- 如果是个人项目，可以使用聚合支付平台

---

### Q2: 支付回调不稳定怎么办？

**A**: 多重保障机制：
1. 主动查询：前端轮询订单状态
2. 被动通知：支付平台回调
3. 定时任务：定期检查未支付订单
4. 手动处理：后台管理功能

---

### Q3: 如何处理退款？

**A**: 实现退款功能：
```typescript
// 微信支付退款
const refund = await payment.refund({
  out_trade_no: order_no,
  out_refund_no: refund_no,
  total: total_amount,
  refund: refund_amount,
  reason: '用户申请退款',
});

// 支付宝退款
const refund = await alipaySdk.exec('alipay.trade.refund', {
  bizContent: {
    out_trade_no: order_no,
    refund_amount: refund_amount,
    refund_reason: '用户申请退款',
  },
});
```

---

### Q4: 如何防止重复支付？

**A**: 订单状态控制：
```typescript
// 检查订单状态
const { data: order } = await supabase
  .from('payment_orders')
  .select('status')
  .eq('order_no', order_no)
  .single();

if (order.status === 'paid') {
  throw new Error('订单已支付');
}

// 使用数据库锁
await supabase.rpc('lock_order', { p_order_no: order_no });
```

---

### Q5: 支付失败如何处理？

**A**: 友好的错误处理：
```typescript
try {
  const result = await createPaymentOrder(...);
} catch (error) {
  if (error.code === 'ORDERPAID') {
    toast.error('订单已支付，请勿重复支付');
  } else if (error.code === 'ORDERCLOSED') {
    toast.error('订单已关闭，请重新下单');
  } else {
    toast.error('支付失败，请稍后重试');
  }
}
```

---

## 📚 相关资源

### 官方文档

- [微信支付开发文档](https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml)
- [支付宝开放平台](https://opendocs.alipay.com/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

### SDK和工具

- [wechatpay-node-v3](https://github.com/klover2/wechatpay-node-v3-ts)
- [alipay-sdk](https://github.com/alipay/alipay-sdk-nodejs-all)
- [qrcode](https://github.com/soldair/node-qrcode)

### 聚合支付平台

- [Ping++](https://www.pingxx.com/)
- [BeeCloud](https://beecloud.cn/)
- [PayJS](https://payjs.cn/)
- [虎皮椒](https://www.xunhupay.com/)

---

**文档版本**：v1.0  
**最后更新**：2026-01-19  
**适用系统**：二手车销售管理系统 v2.0+
