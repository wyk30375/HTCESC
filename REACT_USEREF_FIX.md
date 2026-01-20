# React useRef 错误修复记录

## 错误描述
```
Uncaught TypeError: Cannot read properties of null (reading 'useRef')
at TooltipProvider
```

## 根本原因
- @radix-ui/react-tooltip 组件使用了不同的 React 实例
- Vite 的依赖预构建导致多个 React 实例被加载
- TooltipProvider 尝试调用 useRef 时，React 对象为 null

## 解决方案

### 1. 添加 React Alias 强制指向
在 `vite.config.ts` 中添加：
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    'react': path.resolve(__dirname, './node_modules/react'),
    'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
  },
  dedupe: ['react', 'react-dom'],
}
```

### 2. 添加 Radix UI 组件到依赖预构建
在 `optimizeDeps.include` 中添加：
- @radix-ui/react-tooltip
- @radix-ui/react-dropdown-menu
- @radix-ui/react-popover
- @radix-ui/react-avatar
- @radix-ui/react-separator

### 3. 清理所有缓存
```bash
rm -rf node_modules/.vite dist .vite
```

## 验证步骤
1. 刷新浏览器页面
2. 检查控制台是否还有 useRef 错误
3. 测试 Dashboard 页面的所有卡片点击功能
4. 确认 TooltipProvider 正常工作

## 技术细节
- React 版本: ^18.3.1
- React-DOM 版本: ^18.3.1
- Vite 配置: 强制 dedupe + alias + optimizeDeps

---
**修复时间**: 2026-01-20 13:35 UTC
**状态**: ✅ 已修复
