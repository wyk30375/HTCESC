import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import path from 'path';

import { miaodaDevPlugin } from "miaoda-sc-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr({
      svgrOptions: {
        icon: true, exportType: 'named', namedExport: 'ReactComponent', }, }), miaodaDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // 生产构建优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console.log
        drop_debugger: true, // 移除 debugger
      },
    },
    // 强制重新生成所有文件的哈希值
    assetsInlineLimit: 4096,
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心库
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI 组件库
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],
          // 图表库
          'chart-vendor': ['recharts'],
          // 表单库
          'form-vendor': ['react-hook-form', 'zod'],
        },
      },
    },
    // 提高 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
    // 启用 sourcemap（可选，用于调试）
    sourcemap: false,
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    strictPort: true,
  },
});
