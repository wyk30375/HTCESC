# 会员缴费操作指南

## 📋 目录
- [当前缴费方式](#当前缴费方式)
- [平台管理员操作指南](#平台管理员操作指南)
- [未来在线缴费功能](#未来在线缴费功能)

---

## 当前缴费方式

### 方式一：线下缴费（推荐）

#### 车商操作步骤

1. **查看会员信息**
   - 登录系统
   - 进入"会员中心"页面
   - 查看当前会员等级和应缴费用
   - 记录车行ID和车行名称

2. **联系客服**
   - 提供车行名称
   - 提供当前车辆数量
   - 说明需要续费的会员等级
   - 获取支付账号信息

3. **完成支付**
   - 微信转账：扫描客服提供的二维码
   - 支付宝转账：转账到指定账号
   - 银行转账：转账到公司对公账户

4. **提交凭证**
   - 截图支付凭证
   - 发送给客服
   - 等待客服确认

5. **确认续费**
   - 客服确认后，会员状态自动更新
   - 登录系统查看会员中心
   - 确认会员期限已延长

#### 客服联系方式

- **微信客服**：[待添加]
- **客服电话**：[待添加]
- **工作时间**：周一至周五 9:00-18:00

---

## 平台管理员操作指南

### 场景一：手动记录支付并延长会员期限

#### 步骤1：确认车商信息

1. 登录Supabase Dashboard
2. 进入SQL Editor
3. 查询车商信息：

```sql
-- 查询车商基本信息
SELECT 
  d.id as dealership_id,
  d.name as dealership_name,
  d.code as dealership_code,
  p.username as admin_username,
  p.phone as admin_phone
FROM dealerships d
LEFT JOIN profiles p ON p.dealership_id = d.id AND p.role = 'admin'
WHERE d.name LIKE '%车行名称%'
  OR d.code = '车行编号';
```

#### 步骤2：查询当前会员状态

```sql
-- 查询当前会员信息
SELECT 
  dm.id as membership_id,
  dm.dealership_id,
  d.name as dealership_name,
  mt.tier_name,
  mt.annual_fee,
  dm.start_date,
  dm.end_date,
  dm.is_trial,
  dm.trial_end_date,
  dm.status,
  (SELECT COUNT(*) FROM vehicles WHERE dealership_id = dm.dealership_id AND status = 'available') as vehicle_count
FROM dealership_memberships dm
JOIN dealerships d ON dm.dealership_id = d.id
JOIN membership_tiers mt ON dm.tier_id = mt.id
WHERE dm.dealership_id = '车商ID'
  AND dm.status = 'active'
ORDER BY dm.created_at DESC
LIMIT 1;
```

#### 步骤3：创建新的会员记录

```sql
-- 方法A：使用续费函数（推荐）
-- 注意：需要先在前端或通过API调用，这里提供SQL示例

-- 1. 获取会员等级ID
SELECT id, tier_name, annual_fee 
FROM membership_tiers 
ORDER BY tier_level DESC;

-- 2. 创建新的会员记录
INSERT INTO dealership_memberships (
  dealership_id,
  tier_id,
  start_date,
  end_date,
  is_trial,
  trial_end_date,
  status
) VALUES (
  '车商ID',
  '会员等级ID',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  FALSE,
  NULL,
  'active'
) RETURNING id;
```

#### 步骤4：记录支付信息

```sql
-- 创建支付记录
INSERT INTO membership_payments (
  membership_id,
  dealership_id,
  amount,
  payment_method,
  payment_status,
  payment_date,
  transaction_id,
  notes
) VALUES (
  '新创建的会员记录ID',
  '车商ID',
  198.00,  -- 根据实际会员等级调整
  '微信转账',  -- 或 '支付宝转账'、'银行转账'
  'completed',
  NOW(),
  '支付流水号',
  '线下支付，客服确认'
) RETURNING id;
```

#### 步骤5：更新旧会员记录状态（可选）

```sql
-- 将旧的会员记录标记为已过期
UPDATE dealership_memberships
SET status = 'expired',
    updated_at = NOW()
WHERE dealership_id = '车商ID'
  AND id != '新创建的会员记录ID'
  AND status = 'active';
```

---

### 场景二：手动延长现有会员期限

#### 适用情况
- 车商提前续费
- 赠送会员时长
- 补偿延长

#### 操作步骤

```sql
-- 延长会员期限
UPDATE dealership_memberships
SET end_date = end_date + INTERVAL '1 year',  -- 延长1年
    updated_at = NOW()
WHERE dealership_id = '车商ID'
  AND status = 'active';

-- 同时创建支付记录
INSERT INTO membership_payments (
  membership_id,
  dealership_id,
  amount,
  payment_method,
  payment_status,
  payment_date,
  notes
) VALUES (
  (SELECT id FROM dealership_memberships WHERE dealership_id = '车商ID' AND status = 'active' LIMIT 1),
  '车商ID',
  198.00,
  '微信转账',
  'completed',
  NOW(),
  '续费1年'
);
```

---

### 场景三：手动调整会员等级

#### 适用情况
- 车商申请升级
- 车商申请降级
- 特殊优惠调整

#### 操作步骤

```sql
-- 1. 查询目标会员等级ID
SELECT id, tier_name, annual_fee, min_vehicles, max_vehicles
FROM membership_tiers
ORDER BY tier_level DESC;

-- 2. 更新会员等级
UPDATE dealership_memberships
SET tier_id = '新的会员等级ID',
    updated_at = NOW()
WHERE dealership_id = '车商ID'
  AND status = 'active';

-- 3. 如果需要补差价，创建支付记录
INSERT INTO membership_payments (
  membership_id,
  dealership_id,
  amount,
  payment_method,
  payment_status,
  payment_date,
  notes
) VALUES (
  (SELECT id FROM dealership_memberships WHERE dealership_id = '车商ID' AND status = 'active' LIMIT 1),
  '车商ID',
  167.00,  -- 差价金额
  '微信转账',
  'completed',
  NOW(),
  '升级补差价'
);
```

---

### 场景四：查询所有待续费车商

```sql
-- 查询即将到期的会员（30天内）
SELECT 
  d.id as dealership_id,
  d.name as dealership_name,
  d.contact_person,
  d.contact_phone,
  mt.tier_name,
  mt.annual_fee,
  dm.end_date,
  dm.end_date - CURRENT_DATE as days_remaining,
  (SELECT COUNT(*) FROM vehicles WHERE dealership_id = d.id AND status = 'available') as vehicle_count
FROM dealership_memberships dm
JOIN dealerships d ON dm.dealership_id = d.id
JOIN membership_tiers mt ON dm.tier_id = mt.id
WHERE dm.status = 'active'
  AND dm.end_date <= CURRENT_DATE + INTERVAL '30 days'
  AND dm.end_date >= CURRENT_DATE
ORDER BY dm.end_date ASC;
```

---

### 场景五：查询已到期的会员

```sql
-- 查询已到期的会员
SELECT 
  d.id as dealership_id,
  d.name as dealership_name,
  d.contact_person,
  d.contact_phone,
  mt.tier_name,
  dm.end_date,
  CURRENT_DATE - dm.end_date as days_expired,
  (SELECT COUNT(*) FROM vehicles WHERE dealership_id = d.id AND status = 'available') as vehicle_count
FROM dealership_memberships dm
JOIN dealerships d ON dm.dealership_id = d.id
JOIN membership_tiers mt ON dm.tier_id = mt.id
WHERE dm.status = 'active'
  AND dm.end_date < CURRENT_DATE
ORDER BY dm.end_date ASC;
```

---

### 场景六：批量处理到期会员

```sql
-- 将已到期的会员状态更新为expired
UPDATE dealership_memberships
SET status = 'expired',
    updated_at = NOW()
WHERE status = 'active'
  AND end_date < CURRENT_DATE;
```

---

## 未来在线缴费功能

### 功能规划

#### Phase 1：基础在线支付（开发中）

**功能包括：**
- 在线选择会员等级
- 微信支付集成
- 支付宝支付集成
- 自动生成订单
- 支付成功后自动更新会员状态

**预计上线时间：** 待定

#### Phase 2：高级支付功能

**功能包括：**
- 自动续费
- 发票开具
- 支付优惠券
- 会员推荐奖励
- 批量购买优惠

**预计上线时间：** 待定

---

## 常见问题

### Q1: 如何确认支付是否成功？

**A:** 
1. 车商可以登录系统，进入"会员中心"查看会员状态
2. 如果会员期限已延长，说明支付成功
3. 如果未更新，请联系客服确认

### Q2: 支付后多久会更新会员状态？

**A:** 
- 线下支付：客服确认后立即更新（通常1-2小时内）
- 在线支付（未来）：支付成功后立即自动更新

### Q3: 可以提前续费吗？

**A:** 
- 可以提前续费
- 新的会员期限从当前会员到期日开始计算
- 不会损失剩余的会员时长

### Q4: 如何开具发票？

**A:** 
- 目前需要联系客服申请开具发票
- 提供公司抬头、税号等信息
- 客服会在3-5个工作日内开具并邮寄

### Q5: 支付后可以退款吗？

**A:** 
- 会员费用一经支付，原则上不予退款
- 特殊情况请联系客服协商处理

### Q6: 如何升级会员等级？

**A:** 
- 系统会根据在售车辆数量自动判定等级
- 如需升级，只需补缴差价即可
- 联系客服办理升级手续

### Q7: 如何降级会员等级？

**A:** 
- 车辆数量减少时，系统会自动判定新等级
- 降级在下次续费时生效
- 当前会员期内仍按原等级收费

---

## 支付金额参考

### 会员等级价格表

| 会员等级 | 车辆数量范围 | 年费 | 月均费用 |
|---------|------------|------|---------|
| 三级会员 | 0-20台 | ¥198 | ¥16.5 |
| 二级会员 | 21-50台 | ¥365 | ¥30.4 |
| 一级会员 | 51-150台 | ¥580 | ¥48.3 |
| 金牌会员 | 151台以上 | ¥980 | ¥81.7 |

### 升级补差价计算

**示例：从三级升级到二级**
- 三级会员年费：¥198
- 二级会员年费：¥365
- 补差价：¥365 - ¥198 = ¥167

**注意：** 如果已使用部分会员期限，补差价会按比例计算。

---

## 支付凭证模板

### 微信/支付宝转账凭证

**需要包含的信息：**
- 支付时间
- 支付金额
- 交易流水号
- 收款方信息

**示例：**
```
支付时间：2026-01-10 14:30:00
支付金额：¥198.00
交易流水号：202601101430001234
收款方：二手车销售管理平台
备注：车行名称 - 会员续费
```

### 银行转账凭证

**需要包含的信息：**
- 转账时间
- 转账金额
- 转账流水号
- 收款账户信息
- 付款账户信息

---

## 客服支持

### 联系方式

- **微信客服**：[待添加]
- **客服电话**：[待添加]
- **客服邮箱**：[待添加]
- **工作时间**：周一至周五 9:00-18:00

### 客服处理流程

1. 接收车商续费申请
2. 确认车商信息和会员等级
3. 提供支付账号信息
4. 接收支付凭证
5. 确认支付到账
6. 后台更新会员状态
7. 通知车商续费成功

---

**文档版本**：v1.0  
**最后更新**：2026-01-10  
**适用系统**：二手车销售管理系统 v2.0+
