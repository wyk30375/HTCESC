# 会员制系统实现计划

## 需求概述

车商入驻后实行会员制，具体规则如下：

### 会员等级规则

| 会员等级 | 在售车辆数量 | 年费 |
|---------|------------|------|
| 三级会员 | ≤20台 | 198元 |
| 二级会员 | 21-50台 | 365元 |
| 一级会员 | 51-150台 | 580元 |
| 金牌会员 | ≥151台 | 980元 |

### 免费期规则
- 入驻后6个月为免费期
- 免费期内不收取会费
- 免费期结束后根据在售车辆数量自动判定会员等级

## 实现步骤

### 1. 数据库设计

#### 1.1 会员等级表 (membership_tiers)
```sql
- id: uuid (主键)
- tier_name: text (等级名称：三级会员、二级会员、一级会员、金牌会员)
- tier_level: integer (等级数字：3、2、1、0)
- min_vehicles: integer (最小车辆数)
- max_vehicles: integer (最大车辆数，null表示无上限)
- annual_fee: decimal (年费)
- created_at: timestamp
```

#### 1.2 会员订阅表 (dealership_memberships)
```sql
- id: uuid (主键)
- dealership_id: uuid (车商ID，外键)
- tier_id: uuid (会员等级ID，外键)
- start_date: date (开始日期)
- end_date: date (结束日期)
- is_trial: boolean (是否免费期)
- trial_end_date: date (免费期结束日期)
- status: text (状态：active、expired、cancelled)
- created_at: timestamp
- updated_at: timestamp
```

#### 1.3 支付记录表 (membership_payments)
```sql
- id: uuid (主键)
- membership_id: uuid (会员订阅ID，外键)
- dealership_id: uuid (车商ID，外键)
- amount: decimal (支付金额)
- payment_method: text (支付方式)
- payment_status: text (支付状态：pending、completed、failed)
- payment_date: timestamp (支付时间)
- created_at: timestamp
```

### 2. 核心功能

#### 2.1 自动等级判定
- 根据在售车辆数量自动判定会员等级
- 实时更新会员等级
- 触发时机：
  - 车辆入库
  - 车辆销售
  - 车辆状态变更

#### 2.2 会员状态管理
- 免费期判定（入驻后6个月）
- 会员到期检查
- 会员续费功能
- 会员状态更新

#### 2.3 权限控制
- 会员到期后的功能限制
- 不同等级会员的权限差异（预留）

### 3. UI界面

#### 3.1 会员中心页面
- 显示当前会员等级
- 显示在售车辆数量
- 显示会员到期时间
- 显示免费期剩余时间（如果在免费期内）
- 会员权益说明
- 续费入口

#### 3.2 会员状态提醒
- 免费期即将结束提醒（提前7天）
- 会员即将到期提醒（提前7天）
- 会员已到期提醒

#### 3.3 管理后台
- 查看所有车商会员状态
- 手动调整会员等级/到期时间
- 查看支付记录

### 4. API设计

#### 4.1 会员相关API
- `getMembershipTiers()` - 获取所有会员等级
- `getCurrentMembership(dealershipId)` - 获取当前会员信息
- `calculateMembershipTier(vehicleCount)` - 计算应有的会员等级
- `updateMembershipTier(dealershipId)` - 更新会员等级
- `renewMembership(dealershipId, tierId)` - 续费会员
- `checkMembershipStatus(dealershipId)` - 检查会员状态

#### 4.2 支付相关API
- `createPayment(membershipId, amount)` - 创建支付记录
- `updatePaymentStatus(paymentId, status)` - 更新支付状态
- `getPaymentHistory(dealershipId)` - 获取支付历史

### 5. 业务逻辑

#### 5.1 入驻时
- 创建会员记录
- 设置免费期（6个月）
- 初始等级根据当前在售车辆数量判定

#### 5.2 车辆数量变化时
- 重新计算应有的会员等级
- 如果等级变化，更新会员记录
- 如果升级，立即生效
- 如果降级，等到下次续费时生效

#### 5.3 免费期结束时
- 发送提醒通知
- 引导用户续费
- 如果不续费，限制部分功能

#### 5.4 会员到期时
- 发送到期提醒
- 引导用户续费
- 如果不续费，限制部分功能

### 6. 实现优先级

#### Phase 1: 基础功能（必须）
- [x] 创建数据库表
- [ ] 创建类型定义
- [ ] 创建基础API
- [ ] 创建会员中心页面
- [ ] 实现自动等级判定
- [ ] 实现会员状态检查

#### Phase 2: 完善功能（重要）
- [ ] 添加会员到期提醒
- [ ] 添加续费功能
- [ ] 添加支付记录
- [ ] 管理后台会员管理

#### Phase 3: 增强功能（可选）
- [ ] 会员权益差异化
- [ ] 会员统计分析
- [ ] 会员营销功能

## 注意事项

1. **免费期计算**：从车商审核通过日期开始计算6个月
2. **等级判定**：基于在售车辆数量，实时更新
3. **续费逻辑**：续费时按当前车辆数量对应的等级收费
4. **降级处理**：车辆数量减少导致的降级，在下次续费时生效
5. **升级处理**：车辆数量增加导致的升级，立即生效（需补差价）
6. **到期处理**：会员到期后，限制部分功能，但不删除数据

## 技术实现

### 数据库触发器
- 车辆状态变更时自动更新会员等级
- 会员到期时自动更新状态

### 定时任务
- 每日检查会员到期情况
- 发送到期提醒邮件/通知

### 前端状态管理
- 使用Context管理会员状态
- 实时显示会员信息

## 测试计划

### 单元测试
- 等级判定逻辑测试
- 免费期计算测试
- 到期检查测试

### 集成测试
- 入驻流程测试
- 车辆数量变化测试
- 续费流程测试

### 用户测试
- 会员中心页面测试
- 到期提醒测试
- 续费功能测试

---

**创建时间**: 2026-01-10  
**状态**: 规划中
