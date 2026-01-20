# React Hooks 错误修复记录

## 错误描述
```
Uncaught TypeError: Cannot read properties of null (reading 'useState')
Uncaught TypeError: Cannot read properties of null (reading 'useContext')
Uncaught TypeError: Cannot read properties of null (reading 'useRef')
```

错误发生在多个组件：
- useToast (use-toast.ts)
- AuthProvider (AuthContext.tsx)
- Toaster (toaster.tsx, sonner.tsx)
- TooltipProvider

**关键发现**：错误堆栈显示不同版本的 chunk 文件：
- chunk-IZ5SPT4X.js?v=5335ca63 (旧版本)
- chunk-WLA63DB5.js?v=cfde47d7 (新版本)

## 根本原因
1. **Service Worker 缓存问题**（主要原因）
   - Service Worker 缓存了旧版本的 Vite chunk 文件
   - 浏览器使用缓存的旧文件，导致 React 实例版本不一致
   - 新旧版本的 React 实例无法互操作，导致 Hooks 调用失败

2. Vite 的依赖预构建导致多个 React 实例被加载
3. 某些 Radix UI 组件和第三方库（next-themes）使用了不同的 React 实例

## 解决方案

### ❌ 失败的尝试
1. 添加 React alias 强制指向 - 导致路径解析问题，使错误更严重
2. 只清理 Vite 缓存 - Service Worker 仍在使用旧缓存

### ✅ 正确的解决方案

#### 1. 更新 Service Worker 缓存策略（关键修复）
在 `public/sw.js` 中：

**a. 更新缓存版本号**
```javascript
const CACHE_NAME = 'used-car-management-v2-20260120'; // 强制刷新所有缓存
```

**b. 跳过 Vite chunk 文件缓存**
```javascript
// 跳过 Vite 的开发服务器文件和 chunk 文件（使用网络优先）
if (event.request.url.includes('node_modules/.vite') || 
    event.request.url.includes('.vite') ||
    event.request.url.includes('/@') ||
    event.request.url.match(/\.(js|css|ts|tsx|jsx)\?v=/)) {
  // 网络优先策略：总是从网络获取最新版本
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
  return;
}
```

#### 2. 移除 React Alias
不要在 vite.config.ts 中添加 React 的 alias，只保留 @ 别名：
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
  dedupe: ['react', 'react-dom'],
}
```

#### 3. 添加所有必需的依赖到预构建
在 `optimizeDeps.include` 中添加：
- react
- react-dom
- react/jsx-runtime
- react-router-dom
- **next-themes** (用于主题切换)
- **@radix-ui/react-toast** (用于 toast 通知)
- @radix-ui/react-tooltip
- @radix-ui/react-dropdown-menu
- @radix-ui/react-popover
- @radix-ui/react-avatar
- @radix-ui/react-separator
- 其他所有使用的 Radix UI 组件

#### 4. 保持 dedupe 配置
```typescript
dedupe: ['react', 'react-dom']
```

#### 5. 彻底清理所有缓存
```bash
rm -rf node_modules/.vite dist .vite
```

## 验证步骤
1. **硬刷新浏览器**（最重要！）
   - 按 Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac)
   - 或者按 F12 打开开发者工具，右键刷新按钮，选择"清空缓存并硬性重新加载"

2. **检查 Service Worker 更新**
   - 打开开发者工具 → Application → Service Workers
   - 确认看到新的 Service Worker 正在激活
   - 点击 "Unregister" 注销旧的 Service Worker（如果需要）
   - 点击 "Update" 强制更新

3. **清除浏览器缓存**
   - 打开浏览器设置
   - 清除最近 1 小时的缓存
   - 重新加载页面

4. **验证功能**
   - Dashboard 页面正常显示
   - 控制台没有 React Hooks 错误
   - 所有卡片点击跳转正常
   - Toast 通知正常
   - 主题切换正常

## 技术细节
- React 版本: ^18.3.1
- React-DOM 版本: ^18.3.1
- Vite 配置: dedupe + optimizeDeps (不使用 alias)
- Service Worker: 网络优先策略用于 Vite chunk 文件
- 关键点：Service Worker 不应缓存带版本号的动态文件

## 重要提示
⚠️ **不要添加 React 的 alias 配置**，这会导致模块解析问题！
⚠️ **Service Worker 必须跳过 Vite chunk 文件**，否则会缓存旧版本！
✅ **使用 dedupe + optimizeDeps + Service Worker 网络优先策略的组合**
✅ **每次修改 Vite 配置后，必须更新 Service Worker 版本号**

## Service Worker 缓存策略
- **网络优先**：Vite chunk 文件（.js?v=xxx, .css?v=xxx）
- **缓存优先**：静态资源（图片、字体、manifest.json）
- **不缓存**：API 请求（Supabase）

---
**修复时间**: 2026-01-20 13:50 UTC
**状态**: ✅ 已修复（Service Worker 缓存问题）

