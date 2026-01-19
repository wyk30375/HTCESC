# 车辆数量显示说明

## 问题反馈

用户反馈："易驰公司在售车辆还是59辆"

## 数据验证

### 数据库实际数据

```sql
-- 易驰汽车的实际车辆数
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

## 不同页面的车辆显示逻辑

### 1. 车辆管理页面（/vehicles）

**用途**：车行内部管理，管理自己车行的车辆

**API方法**：`vehiclesApi.getAll()`

**查询逻辑**：
```typescript
async getAll() {
  const dealershipId = await getCurrentDealershipId();
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('dealership_id', dealershipId)  // 只查询当前车行的车辆
    .order('created_at', { ascending: false });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}
```

**显示结果**：
- 易驰汽车登录后：11台车辆（10台在售 + 1台已售）✅
- 好淘车登录后：4台车辆（4台在售）✅
- 鸿运二手车登录后：19台车辆（19台在售）✅

**标签页**：
- "在售车辆"标签：显示当前车行的在售车辆
- "已售车辆"标签：显示当前车行的已售车辆

### 2. 仪表盘页面（/）

**用途**：车行内部统计，显示自己车行的数据

**API方法**：
- `vehiclesApi.getAll()` - 总车辆数
- `vehiclesApi.getInStock()` - 在售车辆数
- `vehiclesApi.getSold()` - 已售车辆数

**查询逻辑**：所有方法都添加了车行过滤

**显示结果**：
- 易驰汽车登录后：
  - 总车辆：11台 ✅
  - 在售车辆：10台 ✅
  - 已售车辆：1台 ✅

### 3. 客户展示页面（/customer-view）

**用途**：客户扫码查看车辆，展示特定车行的在售车辆

**API方法**：`vehiclesApi.getInStock()`

**查询逻辑**：
```typescript
async getInStock() {
  const dealershipId = await getCurrentDealershipId();
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('dealership_id', dealershipId)  // 只查询当前车行的车辆
    .eq('status', 'in_stock')           // 只查询在售车辆
    .order('created_at', { ascending: false });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}
```

**显示结果**：
- 易驰汽车登录后访问：10台在售车辆 ✅
- 好淘车登录后访问：4台在售车辆 ✅
- 鸿运二手车登录后访问：19台在售车辆 ✅

**设计原因**：
- 这是客户扫码后查看车辆的页面
- 客户扫描的是某个特定车行的二维码
- 应该只显示该车行的在售车辆
- 联系方式显示当前车行的联系信息

### 4. 车辆列表页面（/vehicle-list）

**用途**：公开浏览，显示所有车行的在售车辆

**查询逻辑**：直接查询 Supabase，不使用 API

**显示结果**：
- 任何用户访问：59台在售车辆 ✅
- 支持分页、搜索、车行筛选

## 问题诊断

### 用户反馈的问题已修复 ✅

**问题**：易驰公司登录后，客户展示页面显示"共 59 辆车"

**原因**：CustomerView页面之前使用 `getAllInStock()` 方法，返回所有车行的在售车辆

**修复**：改为使用 `getInStock()` 方法，只返回当前车行的在售车辆

**修复后**：易驰汽车登录后，客户展示页面显示"共 10 辆车" ✅

### 如果仍然看到问题

#### 情况1：在客户展示页面（/customer-view）看到59台

**解决方案**：
1. 清除浏览器缓存（Ctrl+Shift+Delete）
2. 强制刷新页面（Ctrl+F5 或 Cmd+Shift+R）
3. 确认已登录正确的车行账号

#### 情况2：在车辆管理页面（/vehicles）

**现象**：易驰汽车登录后，访问 /vehicles，看到59台车辆

**原因**：这是错误的！应该只显示11台车辆

**可能的原因**：
1. 浏览器缓存了旧数据，需要刷新页面（Ctrl+F5 或 Cmd+Shift+R）
2. 代码修改还没有生效

**验证方法**：
1. 打开浏览器开发者工具（F12）
2. 切换到"Network"标签
3. 刷新页面
4. 查看API请求的响应数据
5. 确认返回的车辆数量

#### 情况3：在仪表盘页面（/）

**现象**：易驰汽车登录后，访问首页仪表盘，看到59台车辆

**原因**：这是错误的！应该只显示11台车辆

**可能的原因**：同上

## 如何验证修复是否生效

### 方法1：检查浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 切换到"Console"标签
3. 刷新页面
4. 查看是否有错误信息

### 方法2：检查网络请求

1. 打开浏览器开发者工具（F12）
2. 切换到"Network"标签
3. 刷新页面
4. 找到 `vehicles` 相关的请求
5. 查看请求的响应数据
6. 确认返回的车辆数量

### 方法3：清除浏览器缓存

1. 按 Ctrl+Shift+Delete（Windows）或 Cmd+Shift+Delete（Mac）
2. 选择"缓存的图片和文件"
3. 点击"清除数据"
4. 刷新页面

### 方法4：使用无痕模式

1. 打开浏览器无痕模式（Ctrl+Shift+N 或 Cmd+Shift+N）
2. 访问应用
3. 登录易驰汽车账号
4. 检查车辆数量

## 预期结果

### 易驰汽车登录后

| 页面 | 路径 | 预期显示 | 说明 |
|------|------|---------|------|
| 仪表盘 | / | 11台总车辆<br>10台在售<br>1台已售 | 只显示易驰汽车的车辆 |
| 车辆管理 | /vehicles | 11台车辆 | 只显示易驰汽车的车辆 |
| 客户展示 | /customer-view | 10台在售车辆 | 只显示易驰汽车的在售车辆 ✅ |
| 车辆列表 | /vehicle-list | 59台在售车辆 | 显示所有车行的在售车辆（公开浏览）|

## 下一步操作

### 问题已修复 ✅

客户展示页面（/customer-view）现在正确显示当前车行的在售车辆：
- 易驰汽车：10台 ✅
- 好淘车：4台 ✅
- 鸿运二手车：19台 ✅

### 如果仍然看到59台

请按以下步骤操作：

1. **清除浏览器缓存**：Ctrl+Shift+Delete
2. **强制刷新页面**：Ctrl+F5 或 Cmd+Shift+R
3. **检查控制台错误**：F12 → Console
4. **检查网络请求**：F12 → Network

### 如果在车辆列表页面看到59台

这是正常的！车辆列表页面（/vehicle-list）是公开浏览页面，应该显示所有车行的在售车辆。

## 技术细节

### API过滤逻辑

所有车辆管理相关的API都已添加车行过滤：

```typescript
// src/db/api.ts
export const vehiclesApi = {
  // 获取所有车辆（仅当前车行）
  async getAll() {
    const dealershipId = await getCurrentDealershipId();
    return supabase
      .from('vehicles')
      .select('*')
      .eq('dealership_id', dealershipId)  // ✅ 车行过滤
      .order('created_at', { ascending: false });
  },

  // 获取在售车辆（仅当前车行）
  async getInStock() {
    const dealershipId = await getCurrentDealershipId();
    return supabase
      .from('vehicles')
      .select('*')
      .eq('dealership_id', dealershipId)  // ✅ 车行过滤
      .eq('status', 'in_stock')
      .order('created_at', { ascending: false });
  },

  // 获取已售车辆（仅当前车行）
  async getSold() {
    const dealershipId = await getCurrentDealershipId();
    return supabase
      .from('vehicles')
      .select('*')
      .eq('dealership_id', dealershipId)  // ✅ 车行过滤
      .eq('status', 'sold')
      .order('created_at', { ascending: false });
  },
};
```

**使用场景**：
- `getAll()` - 车辆管理页面、仪表盘统计
- `getInStock()` - 车辆管理页面（在售标签）、客户展示页面 ✅
- `getSold()` - 车辆管理页面（已售标签）

### RLS策略

```sql
-- 已认证用户可以查看：
-- 1. 自己车行的所有车辆
-- 2. 所有在售车辆（用于公开浏览）
CREATE POLICY vehicles_select_policy ON vehicles
FOR SELECT TO authenticated
USING (
  is_super_admin() 
  OR dealership_id = get_user_dealership_id()
  OR status = 'in_stock'
);
```

**注意**：虽然RLS策略允许查看所有在售车辆，但API层面添加了车行过滤，确保车辆管理页面只显示当前车行的车辆。

## 总结

- ✅ 数据库数据正确：易驰汽车11台（10在售+1已售）
- ✅ API过滤正确：所有管理API都添加了车行过滤
- ✅ 车辆管理页面只显示11台
- ✅ 客户展示页面只显示10台在售车辆（已修复）
- ✅ 车辆列表页面显示59台（公开浏览，正常）

### 修复记录

**问题**：客户展示页面显示"共 59 辆车"

**修复时间**：2026-01-10

**修复方案**：
1. 修改CustomerView页面使用 `getInStock()` 替代 `getAllInStock()`
2. 确保客户展示页面只显示当前车行的在售车辆
3. 更新文档说明不同页面的显示逻辑

**相关提交**：c91703c

---

**文档创建时间**：2026-01-10  
**最后更新时间**：2026-01-10  
**相关提交**：0dc627a, 33bcf00, c91703c  
**相关文档**：VEHICLE_API_FILTER_FIX.md, CUSTOMER_VIEW_FIX.md
