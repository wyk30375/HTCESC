# 恏淘车 - Vercel 部署指南（官方推荐）

## 🎯 为什么选择 Vercel？

Vercel 是**秒哒官方推荐**的部署方式，具有以下优势：

### ✅ 免费且强大
- **100GB 免费带宽/月** - 足够中小型车行使用
- **无限次部署** - 随时更新，无需担心次数限制
- **自动 HTTPS** - 无需配置 SSL 证书
- **全球 CDN 加速** - 访问速度快，用户体验好

### ✅ 简单易用
- **一键部署** - 5分钟即可上线
- **自动构建** - 代码更新自动部署
- **零配置** - 开箱即用，无需复杂设置

### ✅ 专业可靠
- **99.99% 可用性** - 稳定可靠
- **实时日志** - 方便调试和监控
- **版本管理** - 支持快速回滚

---

## 🚀 快速部署（5分钟上线）

### 步骤 1：安装 Vercel CLI（1分钟）

```bash
npm install -g vercel
```

### 步骤 2：登录 Vercel（1分钟）

```bash
vercel login
```

按照提示选择登录方式：
- GitHub
- GitLab
- Bitbucket
- Email

### 步骤 3：部署项目（2分钟）

在项目根目录执行：

```bash
vercel
```

按照提示操作：
```
? Set up and deploy "~/恏淘车"? [Y/n] Y
? Which scope do you want to deploy to? 选择您的账号
? Link to existing project? [y/N] N
? What's your project's name? haotaocar
? In which directory is your code located? ./
```

### 步骤 4：配置环境变量（1分钟）

```bash
# 添加 Supabase 配置
vercel env add VITE_SUPABASE_URL
# 输入您的 Supabase URL

vercel env add VITE_SUPABASE_ANON_KEY
# 输入您的 Supabase Anon Key

vercel env add VITE_APP_ID
# 输入：app-8u0242wc45c1

vercel env add VITE_API_ENV
# 输入：production
```

### 步骤 5：生产部署

```bash
vercel --prod
```

### 完成！🎉

部署成功后会显示：
```
✅ Production: https://haotaocar.vercel.app
```

---

## 📱 访问地址

部署完成后，您的系统将在以下地址可用：

### 管理后台
```
https://your-project.vercel.app/
https://your-project.vercel.app/login
```

### 客户展示系统
```
https://your-project.vercel.app/customer-view
```

### 员工内部通报
```
https://your-project.vercel.app/internal-report
```

### 平台管理后台（超级管理员）
```
https://your-project.vercel.app/dealerships
```

---

## 🌐 配置自定义域名

### 方法一：通过 Vercel Dashboard（推荐）

1. 访问 https://vercel.com/dashboard
2. 选择您的项目
3. 点击 **Settings** → **Domains**
4. 点击 **Add Domain**
5. 输入您的域名（例如：www.haotaocar.com）
6. 按照提示配置 DNS

### 方法二：通过 CLI

```bash
vercel domains add www.haotaocar.com
```

### DNS 配置

在您的域名注册商处添加以下记录：

**CNAME 记录**
```
类型: CNAME
名称: www（或 @）
值: cname.vercel-dns.com
```

**或 A 记录**
```
类型: A
名称: @
值: 76.76.21.21
```

---

## 🔄 更新部署

### 方式一：自动部署（推荐）

如果您的代码托管在 Git 仓库（GitHub/GitLab/Bitbucket）：

1. 在 Vercel Dashboard 中连接您的 Git 仓库
2. 每次 `git push` 后自动部署
3. 无需手动操作

### 方式二：手动部署

```bash
# 开发环境预览
vercel

# 生产环境部署
vercel --prod
```

---

## 🔧 环境变量管理

### 通过 Dashboard 管理（推荐）

1. 访问 https://vercel.com/dashboard
2. 选择项目 → **Settings** → **Environment Variables**
3. 添加/修改环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_ID`
   - `VITE_API_ENV`

### 通过 CLI 管理

```bash
# 添加环境变量
vercel env add VARIABLE_NAME

# 查看环境变量
vercel env ls

# 删除环境变量
vercel env rm VARIABLE_NAME
```

---

## 📊 监控和日志

### 查看部署日志

1. 访问 https://vercel.com/dashboard
2. 选择项目 → **Deployments**
3. 点击具体部署查看详细日志

### 查看运行时日志

1. 选择项目 → **Logs**
2. 实时查看应用运行日志
3. 支持按时间、类型筛选

### 性能监控

1. 选择项目 → **Analytics**
2. 查看访问量、性能指标
3. 分析用户行为

---

## 🔙 版本回滚

### 通过 Dashboard 回滚

1. 访问 https://vercel.com/dashboard
2. 选择项目 → **Deployments**
3. 找到要回滚的版本
4. 点击 **⋯** → **Promote to Production**

### 通过 CLI 回滚

```bash
# 查看部署历史
vercel ls

# 回滚到指定版本
vercel rollback [deployment-url]
```

---

## ⚙️ Supabase 配置

### 1. 更新允许的 URL

在 Supabase Dashboard 中：

1. 进入项目设置
2. **Authentication** → **URL Configuration**
3. 添加以下 URL：
   - **Site URL**: `https://your-project.vercel.app`
   - **Redirect URLs**: 
     - `https://your-project.vercel.app/**`
     - `https://your-project.vercel.app/login`

### 2. 配置 CORS

1. 进入项目设置
2. **API** → **CORS**
3. 添加允许的域名：
   - `https://your-project.vercel.app`

### 3. 确认 Edge Functions 已部署

```bash
# 部署所有 Edge Functions
supabase functions deploy change-password
supabase functions deploy send-notification
supabase functions deploy reset-admin-password
```

---

## 🐛 常见问题

### Q: 部署后页面空白？

**A: 检查以下几点：**

1. **环境变量是否正确配置**
   ```bash
   vercel env ls
   ```

2. **查看构建日志**
   - Dashboard → Deployments → 点击部署 → 查看 Build Logs

3. **查看浏览器控制台**
   - 按 F12 打开开发者工具
   - 查看 Console 标签页的错误信息

4. **检查 Supabase URL**
   - 确保 URL 格式正确：`https://xxx.supabase.co`

### Q: 登录失败？

**A: 检查：**

1. **Supabase 配置**
   - 确认 Supabase URL 和 Anon Key 正确
   - 检查 Supabase 允许的 URL 是否包含您的域名

2. **网络连接**
   - 确认可以访问 Supabase 服务

3. **查看日志**
   ```bash
   vercel logs
   ```

### Q: 如何查看实时日志？

**A: 使用 CLI 命令：**

```bash
# 查看实时日志
vercel logs --follow

# 查看最近的日志
vercel logs
```

### Q: 部署速度慢？

**A: 优化建议：**

1. **使用 .vercelignore 排除不必要的文件**
   ```
   node_modules
   .git
   *.md
   .env*
   ```

2. **启用缓存**
   - Vercel 会自动缓存 node_modules
   - 确保 package-lock.json 或 pnpm-lock.yaml 已提交

### Q: 如何设置多个环境？

**A: Vercel 支持三种环境：**

- **Production** - 生产环境
- **Preview** - 预览环境（Git 分支）
- **Development** - 开发环境

为不同环境设置不同的环境变量：
```bash
vercel env add VARIABLE_NAME production
vercel env add VARIABLE_NAME preview
vercel env add VARIABLE_NAME development
```

---

## 💰 费用说明

### 免费版（Hobby）

**完全免费，适合个人和小型车行**

- ✅ 100GB 带宽/月
- ✅ 无限部署次数
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 实时日志
- ✅ 自定义域名

### Pro 版（$20/月）

**适合中大型车行**

- ✅ 1TB 带宽/月
- ✅ 更多并发构建
- ✅ 团队协作功能
- ✅ 密码保护
- ✅ 优先支持

### 建议

- **小型车行（1-3人）**：免费版足够
- **中型车行（4-10人）**：免费版或 Pro 版
- **大型车行（10人以上）**：Pro 版

---

## 🎓 最佳实践

### 1. 使用 Git 自动部署

```bash
# 连接 GitHub 仓库
vercel --prod

# 选择 GitHub 仓库
# 之后每次 git push 自动部署
```

### 2. 设置部署保护

在 Dashboard 中：
- **Settings** → **Deployment Protection**
- 启用密码保护（Pro 版功能）

### 3. 配置自定义构建命令

创建 `vercel.json`：
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### 4. 优化性能

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 5. 设置重定向

```json
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

---

## 📞 技术支持

### Vercel 官方资源

- 📚 **文档**: https://vercel.com/docs
- 💬 **社区**: https://github.com/vercel/vercel/discussions
- 🐛 **问题反馈**: https://github.com/vercel/vercel/issues

### 恏淘车支持

- 📖 **项目文档**: 查看项目中的其他 .md 文件
- 🔧 **Supabase 文档**: https://supabase.com/docs

---

## 🎯 总结

### 为什么 Vercel 是最佳选择？

1. **秒哒官方推荐** ⭐
2. **免费且强大** - 100GB 带宽足够使用
3. **简单易用** - 5分钟即可部署
4. **自动化** - Git push 自动部署
5. **全球加速** - CDN 确保访问速度
6. **专业可靠** - 99.99% 可用性

### 快速开始

```bash
# 1. 安装 CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 配置环境变量
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_APP_ID
vercel env add VITE_API_ENV

# 5. 生产部署
vercel --prod
```

### 下一步

1. ✅ 完成部署
2. ✅ 配置自定义域名
3. ✅ 连接 Git 仓库实现自动部署
4. ✅ 配置 Supabase 允许的 URL
5. ✅ 测试所有功能

---

**祝您部署顺利！🚀**

如有问题，请查看：
- 完整部署指南：`DEPLOYMENT_GUIDE.md`
- 快速部署指南：`QUICK_DEPLOY.md`
