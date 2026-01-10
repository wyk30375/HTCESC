# 二手车销售管理系统 - 部署指南

## 系统概述

这是一个完整的二手车销售管理系统，包含以下核心功能：
- ✅ 用户认证系统（用户名+密码登录）
- ✅ 员工管理（支持多角色分配）
- ✅ 车辆管理（入库、在售、已售）
- ✅ 销售管理（完整的销售流程）
- ✅ 费用管理（按月统计）
- ✅ 利润分配（基于角色的分配规则）
- ✅ 统计分析（数据可视化）
- ✅ 客户展示页面（无需登录）
- ✅ 权限控制（员工可录入，管理员可修改）
- ✅ 图片上传（自动压缩至1MB以下）

## 技术栈

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

### 后端
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **安全**: Row Level Security (RLS)

## 部署前准备

### 1. 环境要求
- Node.js 18+ 
- pnpm 或 npm
- Supabase 账号

### 2. 获取 Supabase 凭证
系统已经初始化了 Supabase，凭证信息存储在环境变量中：
- `VITE_SUPABASE_URL`: Supabase 项目 URL
- `VITE_SUPABASE_ANON_KEY`: Supabase 匿名密钥
- `VITE_APP_ID`: 应用 ID

这些凭证已经配置在 `.env` 文件中，无需手动设置。

## 本地开发

### 1. 安装依赖
```bash
cd /workspace/app-8u0242wc45c1
pnpm install
```

### 2. 启动开发服务器
```bash
pnpm run dev
```

系统将在 `http://localhost:5173` 启动。

### 3. 构建生产版本
```bash
pnpm run build
```

构建产物将输出到 `dist/` 目录。

## 生产部署

### 方案一：Vercel 部署（推荐）

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **登录 Vercel**
```bash
vercel login
```

3. **部署项目**
```bash
cd /workspace/app-8u0242wc45c1
vercel
```

4. **配置环境变量**
在 Vercel 项目设置中添加以下环境变量：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_ID`
- `VITE_API_ENV`

5. **生产部署**
```bash
vercel --prod
```

### 方案二：Netlify 部署

1. **安装 Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **登录 Netlify**
```bash
netlify login
```

3. **初始化项目**
```bash
cd /workspace/app-8u0242wc45c1
netlify init
```

4. **配置构建设置**
- Build command: `pnpm run build`
- Publish directory: `dist`

5. **添加环境变量**
在 Netlify 项目设置中添加环境变量（同 Vercel）

6. **部署**
```bash
netlify deploy --prod
```

### 方案三：传统服务器部署

1. **构建项目**
```bash
pnpm run build
```

2. **安装 Web 服务器**
```bash
npm install -g serve
```

3. **启动服务**
```bash
serve -s dist -l 3000
```

4. **使用 Nginx 反向代理**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

5. **使用 PM2 管理进程**
```bash
npm install -g pm2
pm2 start "serve -s dist -l 3000" --name "car-sales-system"
pm2 save
pm2 startup
```

## 首次使用配置

### 1. 创建管理员账号
1. 访问系统登录页面
2. 点击"注册"
3. 输入用户名和密码
4. 第一个注册的用户会自动成为管理员

### 2. 添加员工信息
1. 使用管理员账号登录
2. 进入"员工管理"页面
3. 点击"添加员工"
4. 填写员工信息并分配角色

### 3. 录入车辆
1. 进入"车辆管理"页面
2. 点击"车辆入库"
3. 填写车辆信息并上传照片
4. 保存后车辆将显示在在售列表中

### 4. 记录销售
1. 进入"销售管理"页面
2. 点击"记录销售"
3. 选择车辆和销售员
4. 填写客户信息和成交价格
5. 系统会自动计算利润

## 数据库说明

### 核心表结构
- `profiles`: 用户信息表
- `employees`: 员工信息表
- `employee_roles`: 员工角色分配表
- `vehicles`: 车辆信息表
- `vehicle_costs`: 车辆成本明细表
- `vehicle_sales`: 销售记录表
- `expenses`: 费用记录表
- `profit_distributions`: 利润分配表
- `monthly_bonuses`: 月度奖金表

### 权限策略
系统使用 Supabase RLS（行级安全）策略：
- **员工权限**: 可以录入新数据，不能修改已有数据
- **管理员权限**: 拥有所有权限，可以修改和删除数据

详细权限说明请参考 `SYSTEM_GUIDE.md`

## 性能优化

### 1. 图片优化
- 所有上传的图片会自动压缩至 1MB 以下
- 使用 WEBP 格式以减小文件大小
- 图片存储在 Supabase Storage 中

### 2. 代码分割
- 使用 React.lazy 和 Suspense 进行代码分割
- 路由级别的懒加载

### 3. 缓存策略
- 静态资源使用长期缓存
- API 响应使用适当的缓存策略

## 监控和维护

### 1. 日志监控
- 使用 Supabase Dashboard 查看数据库日志
- 监控 API 请求和错误

### 2. 数据备份
- Supabase 自动进行每日备份
- 建议定期导出重要数据

### 3. 性能监控
- 使用 Vercel Analytics 或 Google Analytics
- 监控页面加载时间和用户行为

## 常见问题

### Q1: 如何重置管理员密码？
A: 目前系统使用用户名+密码登录，如需重置密码，需要通过 Supabase Dashboard 直接操作数据库。

### Q2: 如何添加更多管理员？
A: 使用现有管理员账号登录，进入"用户管理"页面，将其他用户的角色设置为"管理员"。

### Q3: 图片上传失败怎么办？
A: 检查以下几点：
- 图片格式是否支持（JPEG, PNG, WEBP, GIF, AVIF）
- 文件名是否包含特殊字符（只允许英文字母和数字）
- Supabase Storage 配额是否充足

### Q4: 如何查看系统日志？
A: 
- 前端日志：打开浏览器开发者工具（F12）查看 Console
- 后端日志：登录 Supabase Dashboard 查看 Logs

### Q5: 如何备份数据？
A: 
1. 登录 Supabase Dashboard
2. 进入 Database 页面
3. 使用 SQL Editor 导出数据
4. 或使用 pg_dump 工具进行完整备份

## 技术支持

### 文档
- `README.md`: 项目概述
- `SYSTEM_GUIDE.md`: 系统使用指南
- `PERMISSION_TEST_GUIDE.md`: 权限测试指南
- `PERMISSION_UPDATE_SUMMARY.md`: 权限系统更新说明
- `TODO.md`: 开发进度和注意事项

### 联系方式
如有问题，请查看以上文档或联系系统管理员。

## 更新日志

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

---

**部署完成后，请务必测试以下功能：**
1. ✅ 用户注册和登录
2. ✅ 员工管理和角色分配
3. ✅ 车辆录入和图片上传
4. ✅ 销售记录创建
5. ✅ 费用记录添加
6. ✅ 权限控制（员工 vs 管理员）
7. ✅ 客户展示页面访问

**祝您使用愉快！** 🚗✨
