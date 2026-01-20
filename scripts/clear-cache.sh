#!/bin/bash

# 清除缓存脚本
# 用于解决 Vite 和浏览器缓存导致的问题

echo "🔧 开始清除所有缓存..."
echo ""

# 1. 清除 Vite 缓存
echo "📦 清除 Vite 缓存..."
if [ -d "node_modules/.vite" ]; then
  rm -rf node_modules/.vite
  echo "✅ Vite 缓存已清除"
else
  echo "ℹ️  Vite 缓存目录不存在"
fi
echo ""

# 2. 清除 dist 目录
echo "📦 清除构建产物..."
if [ -d "dist" ]; then
  rm -rf dist
  echo "✅ dist 目录已清除"
else
  echo "ℹ️  dist 目录不存在"
fi
echo ""

# 3. 清除 TypeScript 缓存
echo "📦 清除 TypeScript 缓存..."
if [ -f "tsconfig.tsbuildinfo" ]; then
  rm -f tsconfig.tsbuildinfo
  echo "✅ TypeScript 缓存已清除"
else
  echo "ℹ️  TypeScript 缓存文件不存在"
fi
echo ""

echo "🎉 缓存清除完成！"
echo ""
echo "📝 下一步操作："
echo "1. 重新启动开发服务器：npm run dev"
echo "2. 硬刷新浏览器：Ctrl+Shift+R (Windows/Linux) 或 Cmd+Shift+R (Mac)"
echo ""
