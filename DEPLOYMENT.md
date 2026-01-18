# 恏淘车经营管理平台 - 部署指南

## 📋 部署前准备

### 1. 环境要求
- Node.js 18+ 
- pnpm 8+
- Supabase 项目（已配置）

### 2. 检查配置文件
确保以下环境变量已正确配置：

```bash
# .env 文件
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
VITE_APP_ID=app-8u0242wc45c1
VITE_API_ENV=production
```

## 🚀 部署方案

### 方案一：Vercel 部署（推荐）

#### 优势
- ✅ 零配置，自动构建
- ✅ 全球CDN加速
- ✅ 自动HTTPS
- ✅ 免费额度充足
- ✅ Git集成，自动部署

#### 部署步骤

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
在 Vercel 控制台中设置：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_ID`
- `VITE_API_ENV=production`

5. **生产部署**
```bash
vercel --prod
```

#### Vercel 配置文件
项目根目录创建 `vercel.json`：
```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### 方案二：Netlify 部署

#### 优势
- ✅ 简单易用
- ✅ 自动HTTPS
- ✅ 表单处理
- ✅ 免费额度

#### 部署步骤

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

5. **设置环境变量**
```bash
netlify env:set VITE_SUPABASE_URL "你的URL"
netlify env:set VITE_SUPABASE_ANON_KEY "你的密钥"
netlify env:set VITE_APP_ID "app-8u0242wc45c1"
netlify env:set VITE_API_ENV "production"
```

6. **部署**
```bash
netlify deploy --prod
```

#### Netlify 配置文件
项目根目录创建 `netlify.toml`：
```toml
[build]
  command = "pnpm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### 方案三：自托管服务器部署

#### 适用场景
- 需要完全控制服务器
- 有自己的服务器资源
- 需要自定义配置

#### 部署步骤

1. **构建生产版本**
```bash
cd /workspace/app-8u0242wc45c1
pnpm install
pnpm run build
```

2. **配置 Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/haotaocar/dist;
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

3. **配置 HTTPS（使用 Let's Encrypt）**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

4. **使用 PM2 管理（如果需要 Node.js 服务）**
```bash
npm install -g pm2
pm2 serve dist 3000 --spa
pm2 startup
pm2 save
```

---

## 🔧 生产环境优化

### 1. 构建优化
确保 `vite.config.ts` 包含以下配置：
```typescript
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console.log
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'chart-vendor': ['recharts']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### 2. 环境变量管理
- ✅ 生产环境使用 `.env.production`
- ✅ 敏感信息不要提交到 Git
- ✅ 使用平台的环境变量管理功能

### 3. 性能监控
- 使用 Vercel Analytics 或 Google Analytics
- 监控页面加载时间
- 跟踪用户行为

---

## 📊 数据库部署检查

### Supabase 生产配置

1. **检查 RLS 策略**
```sql
-- 确保所有表都启用了 RLS
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT IN (
  SELECT tablename 
  FROM pg_policies
);
```

2. **备份数据库**
```bash
# 在 Supabase 控制台中设置自动备份
# 或使用 pg_dump 手动备份
```

3. **性能优化**
- 添加必要的索引
- 优化慢查询
- 配置连接池

---

## 🔒 安全检查清单

- [ ] 环境变量已正确配置
- [ ] Supabase RLS 策略已启用
- [ ] HTTPS 已配置
- [ ] CORS 策略已设置
- [ ] 敏感信息已移除（console.log、调试代码）
- [ ] 错误处理已完善
- [ ] 输入验证已实现
- [ ] SQL 注入防护已启用

---

## 📱 域名配置

### 1. 购买域名
推荐域名注册商：
- 阿里云（万网）
- 腾讯云
- GoDaddy
- Namecheap

### 2. DNS 配置
在域名管理后台添加记录：

**Vercel 部署：**
```
类型: CNAME
主机记录: @
记录值: cname.vercel-dns.com
```

**Netlify 部署：**
```
类型: CNAME
主机记录: @
记录值: your-site.netlify.app
```

### 3. SSL 证书
- Vercel/Netlify 自动提供免费 SSL
- 自托管服务器使用 Let's Encrypt

---

## 🧪 部署后测试

### 功能测试清单
- [ ] 用户登录/注册
- [ ] 车辆管理（增删改查）
- [ ] 销售记录
- [ ] 利润分配计算
- [ ] 统计报表
- [ ] 移动端适配
- [ ] 图片上传
- [ ] 数据导出

### 性能测试
```bash
# 使用 Lighthouse 测试
npx lighthouse https://your-domain.com --view

# 使用 WebPageTest
# 访问 https://www.webpagetest.org/
```

---

## 🔄 持续部署（CI/CD）

### GitHub Actions 配置
创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install pnpm
        run: npm install -g pnpm
        
      - name: Install dependencies
        run: pnpm install
        
      - name: Build
        run: pnpm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📞 技术支持

### 常见问题

**Q: 部署后页面空白？**
A: 检查环境变量是否正确配置，查看浏览器控制台错误信息。

**Q: 路由 404 错误？**
A: 确保配置了 SPA 重定向规则（所有路由指向 index.html）。

**Q: 图片上传失败？**
A: 检查 Supabase Storage 权限配置和 CORS 设置。

**Q: 数据库连接失败？**
A: 验证 Supabase URL 和密钥是否正确，检查网络连接。

---

## 🎯 推荐部署方案

**对于本项目，推荐使用 Vercel 部署：**

1. ✅ 零配置，开箱即用
2. ✅ 自动 HTTPS 和 CDN
3. ✅ 与 GitHub 完美集成
4. ✅ 免费额度充足
5. ✅ 性能优秀

**快速部署命令：**
```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
cd /workspace/app-8u0242wc45c1
vercel --prod
```

---

## 📈 监控和维护

### 1. 日志监控
- Vercel 提供实时日志
- Supabase 提供数据库日志
- 配置错误告警

### 2. 性能监控
- 使用 Vercel Analytics
- 配置 Google Analytics
- 监控 Core Web Vitals

### 3. 定期维护
- 每周检查错误日志
- 每月更新依赖包
- 定期备份数据库
- 监控服务器资源使用

---

## ✅ 部署完成检查

部署完成后，请确认：

- [ ] 网站可以正常访问
- [ ] HTTPS 证书有效
- [ ] 所有功能正常工作
- [ ] 移动端显示正常
- [ ] 性能指标达标（Lighthouse > 90）
- [ ] 错误监控已配置
- [ ] 备份策略已设置
- [ ] 域名解析正确
- [ ] SEO 优化完成

---

**祝您部署顺利！🎉**

如有问题，请查看文档或联系技术支持。
