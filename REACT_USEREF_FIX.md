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

## 根本原因
- Vite 的依赖预构建导致多个 React 实例被加载
- 某些 Radix UI 组件和第三方库（next-themes）使用了不同的 React 实例
- 这些组件尝试调用 React Hooks 时，React 对象为 null

## 解决方案

### ❌ 失败的尝试
1. 添加 React alias 强制指向 - 导致路径解析问题，使错误更严重

### ✅ 正确的解决方案

#### 1. 移除 React Alias
不要在 vite.config.ts 中添加 React 的 alias，只保留 @ 别名：
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
  dedupe: ['react', 'react-dom'],
}
```

#### 2. 添加所有必需的依赖到预构建
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

#### 3. 保持 dedupe 配置
```typescript
dedupe: ['react', 'react-dom']
```

#### 4. 彻底清理所有缓存
```bash
rm -rf node_modules/.vite dist .vite
```

## 验证步骤
1. 刷新浏览器页面（硬刷新：Ctrl+Shift+R）
2. 检查控制台是否还有 React Hooks 错误
3. 测试以下功能：
   - Dashboard 页面加载
   - 卡片点击跳转
   - Toast 通知
   - 主题切换
   - Tooltip 显示

## 技术细节
- React 版本: ^18.3.1
- React-DOM 版本: ^18.3.1
- Vite 配置: dedupe + optimizeDeps (不使用 alias)
- 关键点：dedupe 配置足以解决 React 实例重复问题，不需要额外的 alias

## 重要提示
⚠️ **不要添加 React 的 alias 配置**，这会导致模块解析问题！
✅ **只使用 dedupe + optimizeDeps 的组合**

---
**修复时间**: 2026-01-20 13:40 UTC
**状态**: ✅ 已修复

