# 二手车销售管理系统

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)

一款专为二手车行设计的全功能管理系统，支持车辆管理、销售记录、费用统计、利润分配和权限控制。

[快速开始](#快速开始) • [功能特性](#功能特性) • [技术栈](#技术栈) • [文档](#文档) • [部署](#部署)

</div>

---

## 📋 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [核心功能](#核心功能)
- [权限系统](#权限系统)
- [文档](#文档)
- [部署](#部署)
- [常见问题](#常见问题)
- [更新日志](#更新日志)
- [许可证](#许可证)

## ✨ 功能特性

### 🔐 用户认证
- 用户名+密码登录
- 首个用户自动成为管理员
- 基于角色的权限控制（管理员/员工）

### 👥 员工管理
- 员工信息管理（姓名、职位、联系方式、入职时间）
- 多角色分配（地租、月奖金池、销售提成、押车出资人）
- 支持一人多角色、多人一角色
- 员工业绩记录和排行

### 🚗 车辆管理
- 车辆入库（车架号、车牌号、品牌型号、年份、里程数）
- 车辆成本记录（购车款、整备费、过户费、杂费）
- 车辆照片上传（自动压缩至1MB以下）
- 车辆状态跟踪（在售/已售）

### 💰 销售管理
- 销售信息记录（日期、价格、客户信息）
- 销售成本计算（整备费、过户费、杂费）
- 贷款返利记录
- 自动计算总利润
- 销售员关联

### 📊 费用管理
- 车行运营费用记录
- 费用类型分类（租金、水电费、工资、营销等）
- 按月统计费用
- 费用明细查询

### 💵 利润分配
- 自动计算总利润
- 基于角色的利润分配（地租18%、月奖金池10%、销售提成36%、押车出资人36%）
- 支持多人共同分配
- 月度奖金池管理

### 📈 统计分析
- 月度销售统计
- 员工销售排行
- 利润分配明细
- 数据可视化图表

### 📱 客户展示
- 无需登录的车辆展示页面
- 展示在售车辆信息和照片
- 响应式设计，支持手机访问

### 🔒 权限控制
- **员工权限**：可录入新数据，不可修改已有数据
- **管理员权限**：拥有最高权限，可修改所有数据
- 数据库层面的 RLS 策略保护
- 前端 UI 层面的权限控制

## 🛠 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 库**: shadcn/ui + Tailwind CSS
- **路由**: React Router v6
- **状态管理**: React Context + Hooks
- **表单验证**: React Hook Form + Zod
- **图表**: Recharts
- **图标**: Lucide React
- **通知**: Sonner
- **图片处理**: browser-image-compression

### 后端
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **安全**: Row Level Security (RLS)

### 开发工具
- **代码规范**: ESLint + Biome
- **类型检查**: TypeScript
- **包管理**: pnpm

## 🚀 快速开始

### 前置要求
- Node.js 18+
- pnpm (推荐) 或 npm

### 安装

```bash
# 克隆项目
cd /workspace/app-8u0242wc45c1

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

系统将在 `http://localhost:5173` 启动。

### 首次使用

1. **注册管理员账号**
   - 访问系统并点击"注册"
   - 输入用户名和密码
   - 第一个注册的用户自动成为管理员

2. **添加员工**
   - 登录后进入"员工管理"
   - 添加员工信息并分配角色

3. **录入车辆**
   - 进入"车辆管理"
   - 点击"车辆入库"并填写信息

4. **记录销售**
   - 进入"销售管理"
   - 选择车辆并填写销售信息

详细步骤请参考 [快速开始指南](./QUICK_START.md)

## 📁 项目结构

```
app-8u0242wc45c1/
├── src/
│   ├── components/          # 组件
│   │   ├── ui/             # shadcn/ui 组件
│   │   ├── common/         # 通用组件
│   │   └── layouts/        # 布局组件
│   ├── pages/              # 页面组件
│   │   ├── Dashboard.tsx   # 仪表盘
│   │   ├── Employees.tsx   # 员工管理
│   │   ├── Vehicles.tsx    # 车辆管理
│   │   ├── Sales.tsx       # 销售管理
│   │   ├── Expenses.tsx    # 费用管理
│   │   ├── Profits.tsx     # 利润分配
│   │   ├── Statistics.tsx  # 统计分析
│   │   ├── AdminUsers.tsx  # 用户管理
│   │   ├── CustomerView.tsx # 客户展示
│   │   └── Login.tsx       # 登录页面
│   ├── context/            # React Context
│   │   └── AuthContext.tsx # 认证上下文
│   ├── db/                 # 数据库相关
│   │   ├── supabase.ts     # Supabase 客户端
│   │   └── api.ts          # API 封装
│   ├── types/              # TypeScript 类型定义
│   │   └── types.ts
│   ├── lib/                # 工具函数
│   ├── routes.tsx          # 路由配置
│   ├── App.tsx             # 应用入口
│   └── main.tsx            # 主入口
├── supabase/               # Supabase 配置
│   └── migrations/         # 数据库迁移文件
├── public/                 # 静态资源
├── docs/                   # 文档
│   ├── QUICK_START.md      # 快速开始
│   ├── DEPLOYMENT_GUIDE.md # 部署指南
│   ├── SYSTEM_GUIDE.md     # 系统指南
│   └── PERMISSION_TEST_GUIDE.md # 权限测试
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎯 核心功能

### 车辆管理流程
1. 车辆入库 → 2. 记录成本 → 3. 上传照片 → 4. 展示销售 → 5. 记录销售 → 6. 计算利润

### 利润分配规则
- **地租**: 18%
- **月奖金池**: 10%
- **销售提成**: 36%
- **押车出资人**: 36%

### 权限控制
- **数据库层面**: RLS 策略保护
- **前端层面**: UI 控制和权限检查
- **双重验证**: 确保数据安全

## 🔐 权限系统

### 员工权限
- ✅ 录入新车辆
- ✅ 添加车辆成本
- ✅ 创建销售记录
- ✅ 创建费用记录
- ✅ 上传车辆图片
- ✅ 查看所有数据
- ❌ 修改已有数据
- ❌ 删除数据
- ❌ 管理员工信息

### 管理员权限
- ✅ 所有员工权限
- ✅ 修改所有数据
- ✅ 删除数据
- ✅ 管理员工信息
- ✅ 分配员工角色
- ✅ 管理用户权限
- ✅ 更新和删除图片

详细权限说明请参考 [系统指南](./SYSTEM_GUIDE.md)

## 📚 文档

- [快速开始指南](./QUICK_START.md) - 5分钟快速上手
- [系统使用指南](./SYSTEM_GUIDE.md) - 完整的功能说明
- [部署指南](./DEPLOYMENT_GUIDE.md) - 生产环境部署
- [权限测试指南](./PERMISSION_TEST_GUIDE.md) - 权限系统测试
- [权限更新说明](./PERMISSION_UPDATE_SUMMARY.md) - 权限系统技术细节
- [开发进度](./TODO.md) - 项目进度和注意事项

## 🚀 部署

### Vercel 部署（推荐）

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel
```

### Netlify 部署

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 部署
netlify deploy --prod
```

### 传统服务器部署

```bash
# 构建
pnpm run build

# 使用 serve 启动
npx serve -s dist -l 3000
```

详细部署步骤请参考 [部署指南](./DEPLOYMENT_GUIDE.md)

## ❓ 常见问题

### Q: 如何重置管理员密码？
A: 通过 Supabase Dashboard 直接操作数据库。

### Q: 如何添加更多管理员？
A: 使用管理员账号登录，在"用户管理"页面设置其他用户为管理员。

### Q: 图片上传失败怎么办？
A: 检查图片格式、文件名和 Supabase Storage 配额。

### Q: 如何备份数据？
A: 使用 Supabase Dashboard 导出数据或使用 pg_dump 工具。

更多问题请参考 [部署指南](./DEPLOYMENT_GUIDE.md#常见问题)

## 📝 更新日志

### v1.0.0 (2026-01-10)
- ✅ 完整的用户认证系统
- ✅ 员工管理和角色分配
- ✅ 车辆入库和管理
- ✅ 销售记录和客户管理
- ✅ 费用管理和统计
- ✅ 基于角色的权限控制
- ✅ 图片上传和自动压缩
- ✅ 客户展示页面
- ✅ 数据统计和分析

## 📄 许可证

MIT License

Copyright (c) 2026 二手车销售管理系统

---

<div align="center">

**开始使用吧！** 🚗✨

如有任何问题或建议，欢迎提出 Issue 或 Pull Request。

Made with ❤️ by Miaoda

</div>
