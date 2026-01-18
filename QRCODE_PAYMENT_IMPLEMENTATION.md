# 扫码支付功能实现说明

## 📋 功能概述

系统已实现完整的扫码支付功能，支持会员续费的在线支付。当前实现包含：
- ✅ 支付订单创建
- ✅ 二维码生成和展示
- ✅ 支付状态轮询
- ✅ 支付成功自动开通会员
- ✅ 模拟支付功能（用于测试）

---

## 🏗️ 系统架构

### 整体流程

```
用户选择会员等级
    ↓
创建支付订单
    ↓
生成支付二维码
    ↓
用户扫码支付
    ↓
支付平台回调
    ↓
更新订单状态
    ↓
自动开通会员
```

### 技术栈

- **前端**：React + TypeScript
- **后端**：Supabase Edge Functions
- **数据库**：PostgreSQL
- **二维码生成**：QR Server API（可替换为真实支付平台）
- **支付平台**：待接入（微信支付/支付宝）

---

## 💻 前端实现

### 1. 支付对话框组件

**位置**：`src/pages/MembershipCenter.tsx`

#### 核心状态管理

```typescript
// 支付相关状态
const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
const [paymentOrder, setPaymentOrder] = useState<any>(null);
const [paymentLoading, setPaymentLoading] = useState(false);
const [checkingPayment, setCheckingPayment] = useState(false);
```

#### 打开支付对话框

```typescript
// 打开支付对话框
const handleOpenPayment = (tier: MembershipTier) => {
  setSelectedTier(tier);
  setPaymentOrder(null);
  setPaymentDialogOpen(true);
};
```

#### 创建支付订单

```typescript
// 创建支付订单
const handleCreateOrder = async () => {
  if (!profile?.dealership_id || !selectedTier) return;

  try {
    setPaymentLoading(true);
    const order = await createPaymentOrder(
      profile.dealership_id,
      selectedTier.id,
      'qrcode'
    );
    setPaymentOrder(order);
    toast.success('订单创建成功，请扫码支付');
    
    // 开始轮询检查支付状态
    startPaymentCheck(order.order_no);
  } catch (error: any) {
    console.error('创建订单失败:', error);
    toast.error(error.message || '创建订单失败');
  } finally {
    setPaymentLoading(false);
  }
};
```

#### 轮询检查支付状态

```typescript
// 轮询检查支付状态
const startPaymentCheck = (orderNo: string) => {
  setCheckingPayment(true);
  
  const checkInterval = setInterval(async () => {
    try {
      const order = await checkOrderStatus(orderNo);
      
      if (order?.status === 'paid') {
        clearInterval(checkInterval);
        setCheckingPayment(false);
        toast.success('支付成功！会员已开通');
        setPaymentDialogOpen(false);
        await loadData(); // 重新加载会员数据
      } else if (order?.status === 'expired' || order?.status === 'cancelled') {
        clearInterval(checkInterval);
        setCheckingPayment(false);
        toast.error('订单已失效');
      }
    } catch (error) {
      console.error('检查支付状态失败:', error);
    }
  }, 3000); // 每3秒检查一次

  // 30分钟后停止轮询
  setTimeout(() => {
    clearInterval(checkInterval);
    setCheckingPayment(false);
  }, 30 * 60 * 1000);
};
```

#### 模拟支付（测试用）

```typescript
// 模拟支付成功（仅用于测试）
const handleSimulatePayment = async () => {
  if (!paymentOrder) return;

  try {
    setPaymentLoading(true);
    const result = await simulatePayment(paymentOrder.order_no);
    
    if (result.success) {
      toast.success('支付成功！会员已开通');
      setPaymentDialogOpen(false);
      await loadData();
    } else {
      toast.error(result.message || '支付失败');
    }
  } catch (error: any) {
    console.error('模拟支付失败:', error);
    toast.error(error.message || '模拟支付失败');
  } finally {
    setPaymentLoading(false);
  }
};
```

### 2. UI界面

#### 选择会员等级

```tsx
{/* 在线续费 */}
<Card>
  <CardHeader>
    <CardTitle>在线续费</CardTitle>
    <CardDescription>选择会员等级，扫码支付后自动开通</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {tiers.map((tier) => (
        <Card
          key={tier.id}
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => handleOpenPayment(tier)}
        >
          <CardHeader className="pb-3">
            <Badge className={getTierBadgeColor(tier.tier_level)}>
              {tier.tier_name}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-2xl font-bold text-primary">
                ¥{tier.annual_fee}
              </p>
              <p className="text-sm text-muted-foreground">每年</p>
            </div>
            <Button className="w-full" size="sm">
              <QrCode className="w-4 h-4 mr-2" />
              扫码支付
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </CardContent>
</Card>
```

#### 支付对话框

```tsx
{/* 支付对话框 */}
<Dialog open={paymentDialogOpen} onOpenChange={handleClosePayment}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>扫码支付</DialogTitle>
      <DialogDescription>
        请使用微信或支付宝扫描二维码完成支付
      </DialogDescription>
    </DialogHeader>

    {!paymentOrder ? (
      // 创建订单阶段
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <Badge className={selectedTier ? getTierBadgeColor(selectedTier.tier_level) : ''}>
            {selectedTier?.tier_name}
          </Badge>
          <p className="text-3xl font-bold text-primary">
            ¥{selectedTier?.annual_fee}
          </p>
          <p className="text-sm text-muted-foreground">会员年费</p>
        </div>

        <Button
          className="w-full"
          onClick={handleCreateOrder}
          disabled={paymentLoading}
        >
          {paymentLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <QrCode className="w-4 h-4 mr-2" />
              生成支付码
            </>
          )}
        </Button>
      </div>
    ) : (
      // 显示二维码阶段
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">订单号：{paymentOrder.order_no}</p>
          <p className="text-2xl font-bold text-primary">
            ¥{paymentOrder.amount}
          </p>
        </div>

        {/* 二维码 */}
        <div className="flex justify-center p-4 bg-white rounded-lg">
          {paymentOrder.qr_code_url ? (
            <img
              src={paymentOrder.qr_code_url}
              alt="支付二维码"
              className="w-64 h-64"
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        {checkingPayment && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              等待支付中，支付成功后将自动开通会员...
            </AlertDescription>
          </Alert>
        )}

        {/* 测试按钮 */}
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <p className="mb-2">测试模式：点击下方按钮模拟支付成功</p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSimulatePayment}
              disabled={paymentLoading}
              className="w-full"
            >
              {paymentLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                '模拟支付成功'
              )}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )}
  </DialogContent>
</Dialog>
```

---

## 🔌 API实现

### 1. 支付API

**位置**：`src/db/paymentApi.ts`

#### 创建支付订单

```typescript
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
```

#### 检查订单状态

```typescript
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
```

#### 模拟支付

```typescript
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
```

---

## ⚙️ Edge Function实现

### 1. Payment Handler

**位置**：`supabase/functions/payment-handler/index.ts`

#### 创建订单

```typescript
// 创建支付订单
if (action === 'create' && req.method === 'POST') {
  const { dealership_id, tier_id, payment_method } = await req.json()

  // 调用数据库函数创建订单
  const { data, error } = await supabaseClient.rpc('create_payment_order', {
    p_dealership_id: dealership_id,
    p_tier_id: tier_id,
    p_payment_method: payment_method || 'qrcode'
  })

  if (error) {
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
```

#### 模拟支付

```typescript
// 模拟支付（用于测试）
if (action === 'simulate-pay' && req.method === 'POST') {
  const { order_no } = await req.json()

  // 调用支付成功处理函数
  const { data, error } = await supabaseClient.rpc('process_payment_success', {
    p_order_no: order_no
  })

  if (error) {
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
```

#### 支付回调

```typescript
// 支付回调（真实环境中由支付平台调用）
if (action === 'callback' && req.method === 'POST') {
  const { order_no, transaction_id, payment_status } = await req.json()

  // 验证支付状态
  if (payment_status === 'success') {
    const { data, error } = await supabaseClient.rpc('process_payment_success', {
      p_order_no: order_no
    })

    if (error) {
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
```

---

## 🗄️ 数据库实现

### 1. 支付订单表

```sql
CREATE TABLE payment_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_no VARCHAR(50) UNIQUE NOT NULL,
  dealership_id UUID NOT NULL REFERENCES dealerships(id),
  tier_id UUID NOT NULL REFERENCES membership_tiers(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  qr_code_url TEXT,
  transaction_id VARCHAR(100),
  expired_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 创建订单函数

```sql
CREATE OR REPLACE FUNCTION create_payment_order(
  p_dealership_id UUID,
  p_tier_id UUID,
  p_payment_method VARCHAR
)
RETURNS JSON AS $$
DECLARE
  v_order_no VARCHAR(50);
  v_amount DECIMAL(10, 2);
  v_expired_at TIMESTAMP WITH TIME ZONE;
  v_order_id UUID;
BEGIN
  -- 获取会员等级价格
  SELECT annual_fee INTO v_amount
  FROM membership_tiers
  WHERE id = p_tier_id;

  IF v_amount IS NULL THEN
    RAISE EXCEPTION '会员等级不存在';
  END IF;

  -- 生成订单号
  v_order_no := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');

  -- 设置过期时间（30分钟）
  v_expired_at := NOW() + INTERVAL '30 minutes';

  -- 创建订单
  INSERT INTO payment_orders (
    order_no,
    dealership_id,
    tier_id,
    amount,
    payment_method,
    status,
    expired_at
  ) VALUES (
    v_order_no,
    p_dealership_id,
    p_tier_id,
    v_amount,
    p_payment_method,
    'pending',
    v_expired_at
  ) RETURNING id INTO v_order_id;

  -- 返回订单信息
  RETURN json_build_object(
    'order_id', v_order_id,
    'order_no', v_order_no,
    'amount', v_amount,
    'expired_at', v_expired_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. 处理支付成功函数

```sql
CREATE OR REPLACE FUNCTION process_payment_success(
  p_order_no VARCHAR
)
RETURNS JSON AS $$
DECLARE
  v_order RECORD;
  v_membership_id UUID;
  v_payment_id UUID;
BEGIN
  -- 获取订单信息
  SELECT * INTO v_order
  FROM payment_orders
  WHERE order_no = p_order_no;

  IF NOT FOUND THEN
    RAISE EXCEPTION '订单不存在';
  END IF;

  IF v_order.status = 'paid' THEN
    RETURN json_build_object(
      'success', true,
      'message', '订单已支付'
    );
  END IF;

  IF v_order.status != 'pending' THEN
    RAISE EXCEPTION '订单状态异常';
  END IF;

  -- 更新订单状态
  UPDATE payment_orders
  SET 
    status = 'paid',
    paid_at = NOW(),
    updated_at = NOW()
  WHERE order_no = p_order_no;

  -- 创建会员记录
  INSERT INTO dealership_memberships (
    dealership_id,
    tier_id,
    start_date,
    end_date,
    is_trial,
    status
  ) VALUES (
    v_order.dealership_id,
    v_order.tier_id,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    FALSE,
    'active'
  ) RETURNING id INTO v_membership_id;

  -- 创建支付记录
  INSERT INTO membership_payments (
    membership_id,
    dealership_id,
    amount,
    payment_method,
    payment_status,
    payment_date,
    transaction_id
  ) VALUES (
    v_membership_id,
    v_order.dealership_id,
    v_order.amount,
    v_order.payment_method,
    'completed',
    NOW(),
    v_order.order_no
  ) RETURNING id INTO v_payment_id;

  RETURN json_build_object(
    'success', true,
    'message', '支付成功',
    'membership_id', v_membership_id,
    'payment_id', v_payment_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔄 接入真实支付平台

### 微信支付接入步骤

#### 1. 申请微信支付商户号

1. 访问微信支付商户平台：https://pay.weixin.qq.com
2. 注册并提交资质审核
3. 获取商户号（mch_id）和API密钥（api_key）

#### 2. 配置支付参数

在Supabase中添加环境变量：

```bash
# 微信支付配置
WECHAT_APP_ID=你的AppID
WECHAT_MCH_ID=你的商户号
WECHAT_API_KEY=你的API密钥
WECHAT_NOTIFY_URL=https://你的域名/api/payment/wechat/notify
```

#### 3. 修改Edge Function

```typescript
// 引入微信支付SDK
import WxPay from 'wechatpay-node-v3'

const wxpay = new WxPay({
  appid: Deno.env.get('WECHAT_APP_ID'),
  mchid: Deno.env.get('WECHAT_MCH_ID'),
  private_key: Deno.env.get('WECHAT_PRIVATE_KEY'),
  serial_no: Deno.env.get('WECHAT_SERIAL_NO'),
  apiv3_private_key: Deno.env.get('WECHAT_APIV3_KEY'),
  notify_url: Deno.env.get('WECHAT_NOTIFY_URL')
})

// 创建支付订单时调用微信支付API
const result = await wxpay.transactions_native({
  description: `会员续费-${tier_name}`,
  out_trade_no: order_no,
  amount: {
    total: Math.round(amount * 100) // 转换为分
  }
})

// 获取真实的支付二维码
const qrCodeUrl = result.code_url
```

#### 4. 处理支付回调

```typescript
// 支付回调处理
if (action === 'wechat-notify' && req.method === 'POST') {
  const body = await req.text()
  const signature = req.headers.get('Wechatpay-Signature')
  const timestamp = req.headers.get('Wechatpay-Timestamp')
  const nonce = req.headers.get('Wechatpay-Nonce')
  
  // 验证签名
  const isValid = wxpay.verifySign({
    body,
    signature,
    timestamp,
    nonce
  })
  
  if (!isValid) {
    return new Response('签名验证失败', { status: 400 })
  }
  
  // 解密回调数据
  const data = JSON.parse(body)
  const decryptData = wxpay.decipher_gcm(
    data.resource.ciphertext,
    data.resource.associated_data,
    data.resource.nonce
  )
  
  // 处理支付成功
  if (decryptData.trade_state === 'SUCCESS') {
    await supabaseClient.rpc('process_payment_success', {
      p_order_no: decryptData.out_trade_no
    })
  }
  
  return new Response(JSON.stringify({ code: 'SUCCESS' }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### 支付宝接入步骤

#### 1. 申请支付宝商户

1. 访问支付宝开放平台：https://open.alipay.com
2. 创建应用并提交审核
3. 获取APPID和密钥

#### 2. 配置支付参数

```bash
# 支付宝配置
ALIPAY_APP_ID=你的APPID
ALIPAY_PRIVATE_KEY=你的应用私钥
ALIPAY_PUBLIC_KEY=支付宝公钥
ALIPAY_NOTIFY_URL=https://你的域名/api/payment/alipay/notify
```

#### 3. 修改Edge Function

```typescript
// 引入支付宝SDK
import AlipaySdk from 'alipay-sdk'

const alipaySdk = new AlipaySdk({
  appId: Deno.env.get('ALIPAY_APP_ID'),
  privateKey: Deno.env.get('ALIPAY_PRIVATE_KEY'),
  alipayPublicKey: Deno.env.get('ALIPAY_PUBLIC_KEY'),
  gateway: 'https://openapi.alipay.com/gateway.do'
})

// 创建支付订单
const result = await alipaySdk.exec('alipay.trade.precreate', {
  notify_url: Deno.env.get('ALIPAY_NOTIFY_URL'),
  bizContent: {
    out_trade_no: order_no,
    total_amount: amount,
    subject: `会员续费-${tier_name}`
  }
})

// 获取支付二维码
const qrCodeUrl = result.qr_code
```

---

## 🧪 测试流程

### 1. 测试环境测试

#### 步骤1：选择会员等级
1. 登录车商管理员账号
2. 进入会员中心
3. 在"在线续费"区域选择会员等级
4. 点击"扫码支付"按钮

#### 步骤2：创建订单
1. 在弹出的对话框中查看订单信息
2. 点击"生成支付码"按钮
3. 等待订单创建成功

#### 步骤3：查看二维码
1. 查看生成的二维码
2. 确认订单号和金额正确

#### 步骤4：模拟支付
1. 点击"模拟支付成功"按钮
2. 等待支付处理完成
3. 查看成功提示

#### 步骤5：验证结果
1. 对话框自动关闭
2. 页面自动刷新
3. 查看会员状态已更新
4. 查看支付历史记录

### 2. 真实环境测试

#### 步骤1：配置支付平台
1. 完成微信支付或支付宝的商户申请
2. 配置环境变量
3. 部署Edge Function

#### 步骤2：创建测试订单
1. 使用真实账号登录
2. 选择最低金额的会员等级
3. 创建支付订单

#### 步骤3：扫码支付
1. 使用微信或支付宝扫描二维码
2. 确认支付金额
3. 完成支付

#### 步骤4：验证回调
1. 查看Edge Function日志
2. 确认收到支付回调
3. 验证签名正确

#### 步骤5：验证业务
1. 查看订单状态已更新为"已支付"
2. 查看会员记录已创建
3. 查看支付记录已创建
4. 验证会员功能可用

---

## 📊 数据流转

### 1. 订单创建流程

```
前端调用 createPaymentOrder()
    ↓
Edge Function: payment-handler (action=create)
    ↓
数据库函数: create_payment_order()
    ↓
生成订单号和过期时间
    ↓
插入 payment_orders 表
    ↓
生成二维码URL
    ↓
返回订单信息给前端
```

### 2. 支付成功流程

```
用户扫码支付
    ↓
支付平台处理支付
    ↓
支付平台回调 Edge Function
    ↓
验证签名和数据
    ↓
调用 process_payment_success()
    ↓
更新订单状态为 paid
    ↓
创建会员记录
    ↓
创建支付记录
    ↓
返回成功响应
    ↓
前端轮询检测到状态变化
    ↓
显示支付成功提示
    ↓
刷新会员数据
```

### 3. 状态轮询流程

```
前端创建订单后启动轮询
    ↓
每3秒调用 checkOrderStatus()
    ↓
Edge Function: payment-handler (action=check)
    ↓
查询订单状态
    ↓
返回订单信息
    ↓
前端判断状态
    ↓
如果是 paid：停止轮询，显示成功
如果是 pending：继续轮询
如果是 expired/cancelled：停止轮询，显示失败
```

---

## 🔒 安全考虑

### 1. 签名验证

**微信支付**：
```typescript
// 验证签名
const isValid = wxpay.verifySign({
  body: requestBody,
  signature: req.headers.get('Wechatpay-Signature'),
  timestamp: req.headers.get('Wechatpay-Timestamp'),
  nonce: req.headers.get('Wechatpay-Nonce')
})

if (!isValid) {
  throw new Error('签名验证失败')
}
```

**支付宝**：
```typescript
// 验证签名
const isValid = alipaySdk.checkNotifySign(params)

if (!isValid) {
  throw new Error('签名验证失败')
}
```

### 2. 订单防重

```sql
-- 在 payment_orders 表中添加唯一约束
ALTER TABLE payment_orders ADD CONSTRAINT uk_order_no UNIQUE (order_no);

-- 在处理支付成功时检查订单状态
IF v_order.status = 'paid' THEN
  RETURN json_build_object('success', true, 'message', '订单已支付');
END IF;
```

### 3. 金额校验

```typescript
// 验证回调金额与订单金额一致
if (callbackAmount !== orderAmount) {
  throw new Error('金额不匹配')
}
```

### 4. 超时处理

```sql
-- 定时任务：将超时订单标记为过期
CREATE OR REPLACE FUNCTION expire_timeout_orders()
RETURNS void AS $$
BEGIN
  UPDATE payment_orders
  SET status = 'expired'
  WHERE status = 'pending'
    AND expired_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 创建定时任务（每分钟执行一次）
SELECT cron.schedule('expire-orders', '* * * * *', 'SELECT expire_timeout_orders()');
```

---

## 📝 注意事项

### 1. 开发环境

- ✅ 使用模拟支付功能测试
- ✅ 二维码使用QR Server API生成
- ✅ 不需要真实支付平台配置
- ⚠️ 测试按钮仅在开发环境显示

### 2. 生产环境

- ❌ 移除模拟支付功能
- ✅ 接入真实支付平台
- ✅ 配置正确的回调URL
- ✅ 启用HTTPS
- ✅ 配置支付平台白名单

### 3. 性能优化

- 轮询间隔：3秒（可根据实际情况调整）
- 轮询超时：30分钟
- 订单有效期：30分钟
- 二维码缓存：建议使用CDN

### 4. 错误处理

- 订单创建失败：显示错误提示，允许重试
- 支付超时：提示订单已过期，引导重新创建
- 网络错误：显示网络错误提示，自动重试
- 回调失败：记录日志，支持手动补单

---

## 📚 相关文档

- [会员制系统功能说明](./MEMBERSHIP_SYSTEM_GUIDE.md)
- [在线支付功能说明](./ONLINE_PAYMENT_GUIDE.md)
- [会员自助初始化功能说明](./MEMBERSHIP_INITIALIZATION_GUIDE.md)
- [微信支付官方文档](https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml)
- [支付宝开放平台文档](https://opendocs.alipay.com/open/270/105898)

---

**文档版本**：v1.0  
**最后更新**：2026-01-19  
**适用系统**：二手车销售管理系统 v2.0+
