@echo off
REM 清除缓存脚本 (Windows)
REM 用于解决 Vite 和浏览器缓存导致的问题

echo 🔧 开始清除所有缓存...
echo.

REM 1. 清除 Vite 缓存
echo 📦 清除 Vite 缓存...
if exist "node_modules\.vite" (
  rmdir /s /q "node_modules\.vite"
  echo ✅ Vite 缓存已清除
) else (
  echo ℹ️  Vite 缓存目录不存在
)
echo.

REM 2. 清除 dist 目录
echo 📦 清除构建产物...
if exist "dist" (
  rmdir /s /q "dist"
  echo ✅ dist 目录已清除
) else (
  echo ℹ️  dist 目录不存在
)
echo.

REM 3. 清除 TypeScript 缓存
echo 📦 清除 TypeScript 缓存...
if exist "tsconfig.tsbuildinfo" (
  del /f /q "tsconfig.tsbuildinfo"
  echo ✅ TypeScript 缓存已清除
) else (
  echo ℹ️  TypeScript 缓存文件不存在
)
echo.

echo 🎉 缓存清除完成！
echo.
echo 📝 下一步操作：
echo 1. 重新启动开发服务器：npm run dev
echo 2. 硬刷新浏览器：Ctrl+Shift+R
echo.
pause
