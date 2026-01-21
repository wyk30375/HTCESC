# 二手车销售管理系统 - 公共网络部署指南

## 部署概述

本系统包含三个主要部分：
1. **车行管理后台**：管理员和员工使用（电脑端）
2. **客户展示系统**：展示在售车辆给客户（手机端）
3. **员工内部通报**：每日/月度销售通报（手机端）

---

## 部署前准备

### 1. 确认项目状态
```bash
# 检查代码是否通过 lint
npm run lint

# 本地测试构建
npm run build
```

### 2. 准备必要信息
- ✅ Supabase 项目 URL
- ✅ Supabase Anon Key
- ✅ 域名（可选，推荐使用）
- ✅ 部署平台账号（Vercel/Netlify）

---

## 推荐部署方案

### 方案一：Vercel 部署（推荐）

#### 优势
- ✅ 免费额度充足
- ✅ 自动 HTTPS
- ✅ 全球 CDN 加速
- ✅ 自动构建和部署
- ✅ 支持自定义域名

#### 部署步骤

**1. 安装 Vercel CLI**
```bash
npm install -g vercel
```

**2. 登录 Vercel**
```bash
vercel login
```

**3. 部署项目**
```bash
# 在项目根目录执行
vercel

# 按照提示操作：
# - Set up and deploy? Yes
# - Which scope? 选择您的账号
# - Link to existing project? No
# - What's your project's name? 输入项目名称
# - In which directory is your code located? ./
# - Want to override the settings? No
```

**4. 配置环境变量**
```bash
# 方式一：通过 CLI 配置
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_APP_ID

# 方式二：通过 Vercel Dashboard 配置
# 访问 https://vercel.com/dashboard
# 选择项目 → Settings → Environment Variables
# 添加以下变量：
# - VITE_SUPABASE_URL: 您的 Supabase 项目 URL
# - VITE_SUPABASE_ANON_KEY: 您的 Supabase Anon Key
# - VITE_APP_ID: 您的应用 ID
# - VITE_API_ENV: production
```

**5. 重新部署**
```bash
vercel --prod
```

**6. 获取访问地址**
```bash
# 部署成功后会显示：
# ✅ Production: https://your-project.vercel.app
```

---

### 方案二：Netlify 部署

#### 优势
- ✅ 免费额度充足
- ✅ 简单易用
- ✅ 自动 HTTPS
- ✅ 支持自定义域名

#### 部署步骤

**1. 安装 Netlify CLI**
```bash
npm install -g netlify-cli
```

**2. 登录 Netlify**
```bash
netlify login
```

**3. 初始化项目**
```bash
netlify init

# 按照提示操作：
# - Create & configure a new site
# - Team: 选择您的团队
# - Site name: 输入站点名称
# - Build command: npm run build
# - Directory to deploy: dist
```

**4. 配置环境变量**
```bash
# 通过 Netlify Dashboard 配置
# 访问 https://app.netlify.com
# 选择站点 → Site settings → Environment variables
# 添加以下变量：
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_APP_ID
# - VITE_API_ENV: production
```

**5. 部署**
```bash
netlify deploy --prod
```

---

### 方案三：自建服务器部署

#### 适用场景
- 需要完全控制服务器
- 有专业运维团队
- 对数据安全有特殊要求

#### 部署步骤

**1. 构建项目**
```bash
npm run build
```

**2. 配置 Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/your-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**3. 配置 HTTPS（使用 Let's Encrypt）**
```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

**4. 上传文件**
```bash
# 使用 rsync 上传
rsync -avz dist/ user@your-server:/var/www/your-app/dist/

# 或使用 scp
scp -r dist/* user@your-server:/var/www/your-app/dist/
```

---

## 环境变量配置

### 必需的环境变量

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 应用配置
VITE_APP_ID=app-8u0242wc45c1
VITE_API_ENV=production
```

### 可选的环境变量

```bash
# 通知配置（如果使用微信/短信通知）
# 这些配置在 Supabase Secrets 中设置，不需要在前端配置
```

---

## 域名配置

### 1. 购买域名
推荐域名注册商：
- 阿里云（万网）
- 腾讯云
- GoDaddy
- Namecheap

### 2. 配置 DNS

#### Vercel 域名配置
```
1. 在 Vercel Dashboard 中：
   - 选择项目 → Settings → Domains
   - 添加您的域名
   - 按照提示配置 DNS 记录

2. 在域名注册商处添加 DNS 记录：
   类型: CNAME
   名称: @（或 www）
   值: cname.vercel-dns.com
```

#### Netlify 域名配置
```
1. 在 Netlify Dashboard 中：
   - 选择站点 → Domain settings
   - 添加自定义域名
   - 按照提示配置 DNS 记录

2. 在域名注册商处添加 DNS 记录：
   类型: CNAME
   名称: @（或 www）
   值: your-site.netlify.app
```

#### 自建服务器域名配置
```
在域名注册商处添加 DNS 记录：
类型: A
名称: @
值: 您的服务器 IP 地址
```

---

## 访问地址说明

### 管理后台
```
https://your-domain.com/
或
https://your-domain.com/login
```

### 客户展示系统
```
https://your-domain.com/customer-view
或
https://your-domain.com/car-listings
```

### 员工内部通报
```
https://your-domain.com/internal-report
```

### 平台管理后台（超级管理员）
```
https://your-domain.com/dealerships
```

---

## Supabase 配置

### 1. 更新允许的 URL

在 Supabase Dashboard 中：
```
1. 进入项目设置
2. Authentication → URL Configuration
3. 添加以下 URL：
   - Site URL: https://your-domain.com
   - Redirect URLs: 
     * https://your-domain.com/**
     * https://your-domain.com/login
```

### 2. 配置 CORS

在 Supabase Dashboard 中：
```
1. 进入项目设置
2. API → CORS
3. 添加允许的域名：
   - https://your-domain.com
```

### 3. Edge Functions 配置

如果使用了 Edge Functions（如密码修改、通知等）：
```bash
# 确保 Edge Functions 已部署
supabase functions deploy change-password
supabase functions deploy send-notification
supabase functions deploy reset-admin-password
```

---

## 部署后检查清单

### 功能测试
- [ ] 登录功能正常
- [ ] 注册功能正常
- [ ] 车辆管理功能正常
- [ ] 销售管理功能正常
- [ ] 密码修改功能正常
- [ ] 客户展示页面正常
- [ ] 内部通报页面正常
- [ ] 图片上传功能正常

### 性能测试
- [ ] 页面加载速度正常（< 3秒）
- [ ] 图片加载正常
- [ ] 移动端适配正常
- [ ] 不同浏览器兼容性正常

### 安全检查
- [ ] HTTPS 正常工作
- [ ] 环境变量未泄露
- [ ] API 密钥安全
- [ ] 权限控制正常

---

## 常见问题

### Q: 部署后页面空白？
A: 检查以下几点：
1. 环境变量是否正确配置
2. 构建是否成功（检查构建日志）
3. 浏览器控制台是否有错误
4. Supabase URL 是否正确

### Q: 登录失败？
A: 检查：
1. Supabase URL 和 Anon Key 是否正确
2. Supabase 允许的 URL 是否包含您的域名
3. 网络连接是否正常

### Q: 图片无法上传？
A: 检查：
1. Supabase Storage 是否已创建 bucket
2. Storage 权限策略是否正确
3. 文件大小是否超过限制（1MB）

### Q: 如何更新部署？
A: 
- Vercel: `git push` 自动部署，或 `vercel --prod`
- Netlify: `git push` 自动部署，或 `netlify deploy --prod`
- 自建服务器: 重新构建并上传 `dist` 目录

### Q: 如何回滚到之前的版本？
A:
- Vercel: Dashboard → Deployments → 选择版本 → Promote to Production
- Netlify: Dashboard → Deploys → 选择版本 → Publish deploy
- 自建服务器: 恢复之前的 `dist` 目录备份

---

## 性能优化建议

### 1. 启用 CDN
- Vercel 和 Netlify 自动提供 CDN
- 自建服务器可使用 Cloudflare CDN

### 2. 图片优化
- 使用 WebP 格式
- 压缩图片大小
- 使用懒加载

### 3. 代码优化
- 启用代码分割（已配置）
- 压缩 JavaScript 和 CSS（已配置）
- 移除未使用的代码

### 4. 缓存策略
- 静态资源长期缓存
- API 响应适当缓存
- 使用浏览器缓存

---

## 监控和维护

### 1. 错误监控
推荐工具：
- Sentry（错误追踪）
- LogRocket（用户行为录制）
- Google Analytics（访问统计）

### 2. 性能监控
- Vercel Analytics
- Lighthouse CI
- WebPageTest

### 3. 定期维护
- 定期更新依赖包
- 定期备份数据库
- 定期检查安全漏洞
- 定期审查访问日志

---

## 成本估算

### Vercel（推荐）
- 免费版：
  - 100GB 带宽/月
  - 无限部署
  - 自动 HTTPS
  - 适合中小型应用

- Pro 版（$20/月）：
  - 1TB 带宽/月
  - 更多并发构建
  - 团队协作功能

### Netlify
- 免费版：
  - 100GB 带宽/月
  - 300 分钟构建时间/月
  - 适合中小型应用

- Pro 版（$19/月）：
  - 1TB 带宽/月
  - 更多构建时间

### 自建服务器
- 云服务器：¥100-500/月
- 域名：¥50-100/年
- SSL 证书：免费（Let's Encrypt）
- 运维成本：根据团队情况

---

## 技术支持

### 遇到问题？
1. 查看本文档的"常见问题"部分
2. 检查浏览器控制台错误
3. 查看 Supabase 日志
4. 查看部署平台日志

### 联系方式
- 技术文档：查看项目中的其他 .md 文件
- Supabase 文档：https://supabase.com/docs
- Vercel 文档：https://vercel.com/docs
- Netlify 文档：https://docs.netlify.com

---

## 附录

### A. 构建命令
```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

### B. 项目结构
```
/
├── src/              # 源代码
├── dist/             # 构建输出（部署此目录）
├── public/           # 静态资源
├── supabase/         # Supabase 配置和函数
├── package.json      # 依赖配置
└── vite.config.ts    # Vite 配置
```

### C. 重要文件
- `.env.local` - 本地环境变量（不要提交到 Git）
- `vercel.json` - Vercel 配置（如需自定义）
- `netlify.toml` - Netlify 配置（如需自定义）

---

## 总结

选择合适的部署方案：
- **小型应用/个人项目**：Vercel 或 Netlify（免费版）
- **中型应用/团队项目**：Vercel Pro 或 Netlify Pro
- **大型应用/企业项目**：自建服务器 + CDN

推荐流程：
1. 先使用 Vercel 免费版快速部署测试
2. 配置自定义域名
3. 根据实际使用情况决定是否升级或迁移

祝您部署顺利！🚀
