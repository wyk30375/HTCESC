# 在线扫码支付功能说明

## 📋 功能概述

二手车销售管理系统现已支持在线扫码支付功能，车商可以通过扫描二维码完成会员续费，支付成功后系统自动开通会员资格，无需人工审核。

---

## 🎯 功能特点

### 1. 即时开通
- 支付成功后立即开通会员资格
- 无需等待人工审核
- 自动创建会员记录和支付记录

### 2. 安全可靠
- 订单号唯一性保证
- 支付状态实时验证
- 订单30分钟自动过期

### 3. 用户友好
- 简单的支付流程
- 清晰的支付状态提示
- 自动轮询检查支付结果

---

## 💳 支付流程

### 车商操作流程

#### 步骤1：进入会员中心
1. 登录系统
2. 点击左侧菜单"会员中心"
3. 找到"在线续费"卡片

#### 步骤2：选择会员等级
1. 查看四个会员等级的价格
2. 点击想要购买的会员等级卡片
3. 弹出支付对话框

#### 步骤3：生成支付码
1. 确认会员等级和金额
2. 点击"生成支付码"按钮
3. 等待二维码生成（约1-2秒）

#### 步骤4：扫码支付
1. 使用微信或支付宝扫描二维码
2. 确认支付金额
3. 完成支付

#### 步骤5：等待开通
1. 支付成功后，系统自动检测支付状态
2. 约3-5秒后显示"支付成功！会员已开通"
3. 自动关闭支付对话框
4. 会员中心页面自动刷新，显示新的会员信息

---

## 🔧 技术实现

### 系统架构

```
前端（React）
    ↓
Edge Function（payment-handler）
    ↓
数据库（Supabase PostgreSQL）
    ↓
自动触发会员开通
```

### 核心组件

#### 1. 数据库表

**payment_orders（支付订单表）**
- 存储支付订单信息
- 订单号、金额、状态、二维码URL等
- 订单有效期30分钟

**字段说明：**
- `order_no`: 订单号（唯一）
- `dealership_id`: 车商ID
- `tier_id`: 会员等级ID
- `amount`: 支付金额
- `status`: 订单状态（pending/paying/paid/cancelled/expired）
- `qr_code_url`: 二维码URL
- `expired_at`: 过期时间
- `paid_at`: 支付时间

#### 2. Edge Function

**payment-handler**

**功能：**
- 创建支付订单（action=create）
- 检查订单状态（action=check）
- 处理支付回调（action=callback）
- 模拟支付（action=simulate-pay，仅测试用）

**API端点：**
```
POST /functions/v1/payment-handler?action=create
GET  /functions/v1/payment-handler?action=check&order_no=xxx
POST /functions/v1/payment-handler?action=callback
POST /functions/v1/payment-handler?action=simulate-pay
```

#### 3. 数据库函数

**create_payment_order()**
- 生成唯一订单号
- 创建支付订单
- 设置30分钟过期时间
- 返回订单信息

**process_payment_success()**
- 验证订单状态
- 更新订单为已支付
- 创建会员记录（1年有效期）
- 创建支付记录
- 返回处理结果

**check_order_status()**
- 查询订单状态
- 返回订单详细信息

**cancel_expired_orders()**
- 自动取消过期订单
- 定时任务执行（每5分钟）

#### 4. 前端组件

**MembershipCenter.tsx**

**新增功能：**
- 在线续费卡片
- 支付对话框
- 二维码显示
- 支付状态轮询
- 模拟支付按钮（测试用）

**状态管理：**
- `paymentDialogOpen`: 支付对话框开关
- `selectedTier`: 选中的会员等级
- `paymentOrder`: 支付订单信息
- `paymentLoading`: 支付加载状态
- `checkingPayment`: 支付检查状态

---

## 🧪 测试功能

### 模拟支付

由于这是演示系统，提供了模拟支付功能用于测试：

#### 使用方法
1. 生成支付二维码后
2. 在支付对话框中找到黄色提示框
3. 点击"模拟支付成功"按钮
4. 系统模拟支付成功流程
5. 自动开通会员资格

#### 注意事项
- 模拟支付仅用于测试
- 真实环境需要接入微信支付/支付宝API
- 模拟支付不会产生真实交易

---

## 📊 支付状态说明

### 订单状态

| 状态 | 说明 | 用户操作 |
|------|------|---------|
| pending | 待支付 | 扫码支付 |
| paying | 支付中 | 等待支付完成 |
| paid | 已支付 | 会员已开通 |
| cancelled | 已取消 | 重新创建订单 |
| expired | 已过期 | 重新创建订单 |

### 支付流程图

```
创建订单 → 生成二维码 → 扫码支付 → 支付成功 → 自动开通会员
   ↓           ↓           ↓           ↓           ↓
pending    pending     paying      paid      会员记录创建
                                              支付记录创建
```

---

## 🔒 安全机制

### 1. 订单唯一性
- 订单号格式：PO + 年月日 + 6位随机数
- 数据库唯一约束
- 防止重复订单

### 2. 订单过期
- 订单创建后30分钟自动过期
- 过期订单无法支付
- 定时任务自动清理

### 3. 支付验证
- 支付状态实时验证
- 防止重复支付
- 订单状态检查

### 4. 权限控制
- RLS策略保护数据
- 车商只能查看自己的订单
- 平台管理员可查看所有订单

---

## 💡 使用建议

### 车商端

#### 1. 及时支付
- 订单创建后请在30分钟内完成支付
- 超时后需要重新创建订单

#### 2. 确认金额
- 支付前请确认会员等级和金额
- 确保选择正确的会员等级

#### 3. 保存凭证
- 支付成功后记录订单号
- 如有问题可联系客服查询

### 平台管理员

#### 1. 监控订单
- 定期查看支付订单状态
- 处理异常订单

#### 2. 数据分析
- 统计支付成功率
- 分析会员等级分布

#### 3. 客服支持
- 协助处理支付问题
- 手动处理特殊情况

---

## 🐛 常见问题

### Q1: 支付后没有自动开通会员？

**A:** 
1. 检查支付是否真的成功
2. 等待3-5秒，系统会自动检测
3. 刷新页面查看会员状态
4. 如果仍未开通，联系客服提供订单号

### Q2: 订单过期了怎么办？

**A:** 
1. 关闭支付对话框
2. 重新选择会员等级
3. 生成新的支付码
4. 在30分钟内完成支付

### Q3: 可以取消订单吗？

**A:** 
1. 未支付的订单可以直接关闭对话框
2. 30分钟后订单自动过期
3. 已支付的订单无法取消

### Q4: 支付失败了怎么办？

**A:** 
1. 检查支付账户余额
2. 检查网络连接
3. 重新生成支付码
4. 联系客服协助处理

### Q5: 如何查看支付历史？

**A:** 
1. 进入会员中心
2. 滚动到"支付历史"卡片
3. 查看所有支付记录

### Q6: 模拟支付按钮在哪里？

**A:** 
1. 生成支付二维码后
2. 在支付对话框底部
3. 黄色提示框内
4. 仅测试环境可见

---

## 🚀 未来功能规划

### Phase 1: 真实支付集成（开发中）

**功能包括：**
- 接入微信支付API
- 接入支付宝API
- 真实支付回调处理
- 支付安全验证

**预计上线时间：** 待定

### Phase 2: 支付增强功能

**功能包括：**
- 支付优惠券
- 批量购买优惠
- 会员推荐奖励
- 自动续费

**预计上线时间：** 待定

### Phase 3: 财务管理

**功能包括：**
- 电子发票开具
- 支付对账
- 财务报表
- 退款处理

**预计上线时间：** 待定

---

## 📞 技术支持

### 联系方式

- **微信客服**：[待添加]
- **客服电话**：[待添加]
- **客服邮箱**：[待添加]
- **工作时间**：周一至周五 9:00-18:00

### 技术文档

- [会员制系统功能说明](./MEMBERSHIP_SYSTEM_GUIDE.md)
- [会员缴费操作指南](./MEMBERSHIP_PAYMENT_GUIDE.md)
- [会员制系统测试指南](./MEMBERSHIP_TEST_GUIDE.md)
- [会员缴费快速指南](./MEMBERSHIP_QUICK_GUIDE.md)

---

## 📝 开发者说明

### 真实环境部署

#### 1. 接入微信支付

```typescript
// 创建微信支付订单
const wechatOrder = await createWechatPayOrder({
  out_trade_no: order_no,
  total_fee: amount * 100, // 单位：分
  body: `会员续费-${tier_name}`,
  notify_url: 'https://your-domain.com/api/wechat-callback'
});

// 生成支付二维码
const qr_code_url = wechatOrder.code_url;
```

#### 2. 接入支付宝

```typescript
// 创建支付宝订单
const alipayOrder = await createAlipayOrder({
  out_trade_no: order_no,
  total_amount: amount,
  subject: `会员续费-${tier_name}`,
  notify_url: 'https://your-domain.com/api/alipay-callback'
});

// 生成支付二维码
const qr_code_url = alipayOrder.qr_code;
```

#### 3. 处理支付回调

```typescript
// 验证签名
const isValid = verifySignature(callbackData);

if (isValid && callbackData.trade_status === 'TRADE_SUCCESS') {
  // 调用process_payment_success函数
  await processPaymentSuccess(callbackData.out_trade_no);
}
```

#### 4. 安全配置

- 配置支付密钥到环境变量
- 使用HTTPS协议
- 验证支付回调签名
- 记录所有支付日志

---

**文档版本**：v1.0  
**最后更新**：2026-01-10  
**适用系统**：二手车销售管理系统 v2.0+
