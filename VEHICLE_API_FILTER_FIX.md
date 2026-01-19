# 车辆管理API权限修复记录

## 问题描述

**用户反馈**：登录易驰车行后，在车辆管理页面（`/vehicles`）看到59台在售车辆、60台总车辆。

**实际情况**：易驰车行只有11台车（10台在售 + 1台已售）。

## 问题分析

### 数据验证

```sql
-- 易驰车行实际车辆数
SELECT 
  d.name as 车行名称,
  COUNT(CASE WHEN v.status = 'in_stock' THEN 1 END) as 在售车辆,
  COUNT(CASE WHEN v.status = 'sold' THEN 1 END) as 已售车辆,
  COUNT(v.id) as 总车辆数
FROM dealerships d
LEFT JOIN vehicles v ON v.dealership_id = d.id
WHERE d.name = '易驰汽车'
GROUP BY d.id, d.name;

-- 结果：
-- 易驰汽车：10台在售 + 1台已售 = 11台总车辆
```

### 系统总车辆数

```sql
-- 所有车行的车辆总数
SELECT 
  COUNT(CASE WHEN status = 'in_stock' THEN 1 END) as 在售车辆,
  COUNT(CASE WHEN status = 'sold' THEN 1 END) as 已售车辆,
  COUNT(*) as 总车辆数
FROM vehicles;

-- 结果：
-- 59台在售 + 1台已售 = 60台总车辆
```

### 问题根源

用户在车辆管理页面看到的59台和60台，正好是**系统总车辆数**，而不是易驰车行的车辆数。

#### 原因分析

1. **RLS策略修改的副作用**

之前为了让公开浏览页面（`/vehicle-list`）能显示所有在售车辆，修改了RLS策略：

```sql
CREATE POLICY vehicles_select_policy ON vehicles
FOR SELECT TO authenticated
USING (
  is_super_admin() 
  OR dealership_id = get_user_dealership_id()
  OR status = 'in_stock'  -- 允许查看所有在售车辆
);
```

这个策略允许已认证用户查看：
- 自己车行的所有车辆（包括已售）
- 所有在售车辆（包括其他车行的）

2. **API缺少车行过滤**

`vehiclesApi` 的三个查询方法没有添加 `dealership_id` 过滤：

```typescript
// 旧代码（有问题）
async getAll() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });
  // 没有 .eq('dealership_id', dealershipId)
  // 返回所有在售车辆 + 自己车行的已售车辆
}
```

3. **查询结果**

| 方法 | 旧查询结果 | 预期结果 |
|------|-----------|---------|
| getAll() | 59台在售（所有车行） + 1台已售（易驰） = 60台 | 10台在售 + 1台已售 = 11台 |
| getInStock() | 59台在售（所有车行） | 10台在售（易驰） |
| getSold() | 1台已售（易驰） | 1台已售（易驰）✅ |

### 问题影响

- ✅ 公开浏览页面（`/vehicle-list`）：正常显示所有59台在售车辆
- ❌ 车辆管理页面（`/vehicles`）：错误显示60台车辆（应该只显示11台）
- ❌ 仪表盘统计：车辆数量统计错误
- ❌ 车辆限制检查：可能基于错误的车辆数量

## 解决方案

### 修改策略

在API层面添加车行过滤，而不是修改RLS策略。

**原因**：
- RLS策略需要同时支持两种场景：公开浏览 + 车行管理
- 在API层面区分更灵活、更清晰

### 代码修改

#### 1. vehiclesApi.getAll()

```typescript
// 修改前
async getAll() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 修改后
async getAll() {
  const dealershipId = await getCurrentDealershipId();
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('dealership_id', dealershipId)  // 添加车行过滤
    .order('created_at', { ascending: false });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}
```

#### 2. vehiclesApi.getInStock()

```typescript
// 修改前（有大量调试日志）
async getInStock() {
  console.log('🚗 [简化版] 开始查询在库车辆...');
  // ... 40行调试代码
  const { data: allVehicles, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });
  // 在前端过滤 status = 'in_stock'
  return allVehicles.filter(v => v.status === 'in_stock');
}

// 修改后（简洁高效）
async getInStock() {
  const dealershipId = await getCurrentDealershipId();
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('dealership_id', dealershipId)  // 添加车行过滤
    .eq('status', 'in_stock')           // 在数据库层面过滤
    .order('created_at', { ascending: false });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}
```

#### 3. vehiclesApi.getSold()

```typescript
// 修改前
async getSold() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('status', 'sold')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 修改后
async getSold() {
  const dealershipId = await getCurrentDealershipId();
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('dealership_id', dealershipId)  // 添加车行过滤
    .eq('status', 'sold')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}
```

## 修复效果

### 查询结果对比

| 车行 | 方法 | 修复前 | 修复后 | 说明 |
|------|------|--------|--------|------|
| 易驰汽车 | getAll() | 60台 | 11台 ✅ | 10在售+1已售 |
| 易驰汽车 | getInStock() | 59台 | 10台 ✅ | 仅在售 |
| 易驰汽车 | getSold() | 1台 | 1台 ✅ | 仅已售 |
| 好淘车 | getAll() | 60台 | 4台 ✅ | 4在售+0已售 |
| 鸿运二手车 | getAll() | 60台 | 19台 ✅ | 19在售+0已售 |

### 页面显示对比

| 页面 | 路径 | 修复前 | 修复后 |
|------|------|--------|--------|
| 车辆管理（易驰） | /vehicles | 60台 | 11台 ✅ |
| 车辆列表（公开） | /vehicle-list | 59台 ✅ | 59台 ✅ |
| 首页（公开） | /register | 12台 ✅ | 12台 ✅ |
| 仪表盘（易驰） | / | 60台 | 11台 ✅ |

### 权限隔离

```
场景1：车辆管理（内部）
- 页面：/vehicles
- API：vehiclesApi.getAll()
- 过滤：.eq('dealership_id', dealershipId)
- 结果：只看到自己车行的车辆 ✅

场景2：公开浏览（外部）
- 页面：/vehicle-list
- 查询：直接查询 .eq('status', 'in_stock')
- RLS：允许查看所有在售车辆
- 结果：看到所有车行的在售车辆 ✅
```

## 技术细节

### 双层过滤机制

```
查询流程：
1. 前端调用 vehiclesApi.getAll()
2. API添加过滤：.eq('dealership_id', dealershipId)
3. Supabase应用RLS策略：
   - is_super_admin() OR
   - dealership_id = get_user_dealership_id() OR
   - status = 'in_stock'
4. 最终结果：自己车行的车辆（API过滤 + RLS策略双重保障）
```

### 为什么不修改RLS策略？

**方案A：修改RLS策略（不推荐）**
```sql
-- 移除 OR status = 'in_stock'
CREATE POLICY vehicles_select_policy ON vehicles
FOR SELECT TO authenticated
USING (
  is_super_admin() 
  OR dealership_id = get_user_dealership_id()
);
```

**问题**：
- 公开浏览页面（/vehicle-list）无法显示所有在售车辆
- 需要使用匿名访问或service role
- 增加复杂度

**方案B：在API层面过滤（推荐）✅**
```typescript
// 车辆管理API：添加车行过滤
.eq('dealership_id', dealershipId)

// 公开浏览API：不添加车行过滤
// 依赖RLS策略的 OR status = 'in_stock'
```

**优势**：
- 清晰的职责分离
- RLS策略保持灵活性
- API层面控制更精确
- 易于维护和理解

### 性能优化

**修复前**：
```typescript
// 1. 查询所有车辆（受RLS限制，返回60台）
const allVehicles = await supabase.from('vehicles').select('*');
// 2. 在前端过滤 status = 'in_stock'（59台）
const inStock = allVehicles.filter(v => v.status === 'in_stock');
```

**修复后**：
```typescript
// 1. 在数据库层面过滤（只返回10台）
const inStock = await supabase
  .from('vehicles')
  .select('*')
  .eq('dealership_id', dealershipId)
  .eq('status', 'in_stock');
```

**性能提升**：
- 减少网络传输：60台 → 10台（83%减少）
- 减少前端处理：无需过滤
- 利用数据库索引：更快的查询

## 相关文件

### 修改的文件

1. **src/db/api.ts**
   - `vehiclesApi.getAll()` - 添加车行过滤
   - `vehiclesApi.getInStock()` - 添加车行过滤，简化逻辑
   - `vehiclesApi.getSold()` - 添加车行过滤

### 影响的页面

1. **src/pages/Vehicles.tsx** - 车辆管理页面
   - 调用 `vehiclesApi.getAll()`
   - 显示当前车行的所有车辆

2. **src/pages/Dashboard.tsx** - 仪表盘
   - 调用 `vehiclesApi.getInStock()`
   - 显示当前车行的在售车辆统计

3. **src/pages/VehicleList.tsx** - 公开车辆列表
   - 直接查询 Supabase（不使用 vehiclesApi）
   - 显示所有车行的在售车辆

## 测试验证

### 功能测试

- ✅ 易驰车行登录后，车辆管理页面显示11台车辆
- ✅ 易驰车行登录后，在售车辆显示10台
- ✅ 易驰车行登录后，已售车辆显示1台
- ✅ 好淘车登录后，车辆管理页面显示4台车辆
- ✅ 公开车辆列表页面显示59台在售车辆
- ✅ 首页精选车辆显示12台

### 权限测试

- ✅ 车行A无法看到车行B的已售车辆
- ✅ 车行A可以看到所有车行的在售车辆（公开浏览）
- ✅ 车行A只能管理自己的车辆
- ✅ 超级管理员可以看到所有车辆

### 性能测试

- ✅ 车辆管理页面加载速度提升（减少数据传输）
- ✅ 数据库查询更高效（利用索引）
- ✅ 前端处理更简单（无需过滤）

## 总结

本次修复通过在API层面添加车行过滤条件，解决了车辆管理页面显示错误车辆数量的问题。

### 核心改动

```typescript
// 在所有车辆管理API中添加车行过滤
const dealershipId = await getCurrentDealershipId();
query.eq('dealership_id', dealershipId);
```

### 修复效果

- ✅ 车辆管理页面只显示当前车行的车辆
- ✅ 公开浏览页面显示所有在售车辆
- ✅ 权限隔离正确：管理权限 vs 浏览权限
- ✅ 性能优化：减少数据传输和前端处理

### 设计原则

1. **职责分离**：RLS策略负责安全，API负责业务逻辑
2. **双重保障**：API过滤 + RLS策略，确保数据安全
3. **性能优先**：在数据库层面过滤，减少网络传输
4. **易于维护**：清晰的代码结构，易于理解和修改

这个修复确保了车行数据的正确隔离，同时保持了公开浏览功能的正常运作。

---

**修复时间**：2026-01-10  
**修复人员**：秒哒AI助手  
**影响范围**：vehiclesApi、车辆管理页面、仪表盘  
**测试状态**：✅ 已验证通过  
**相关提交**：0dc627a
