# 快速部署指南 - 5分钟上线

## 最快部署方式：Vercel（推荐）

### 步骤 1：准备环境变量（1分钟）

在项目根目录创建 `.env.production` 文件：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_ID=app-8u0242wc45c1
VITE_API_ENV=production
```

### 步骤 2：安装 Vercel CLI（1分钟）

```bash
npm install -g vercel
```

### 步骤 3：登录 Vercel（1分钟）

```bash
vercel login
```

### 步骤 4：部署（2分钟）

```bash
# 在项目根目录执行
vercel

# 按提示操作，全部选择默认即可
```

### 步骤 5：配置环境变量并重新部署

```bash
# 添加环境变量
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_APP_ID
vercel env add VITE_API_ENV

# 生产部署
vercel --prod
```

### 完成！🎉

部署成功后会显示访问地址：
```
✅ Production: https://your-project.vercel.app
```

---

## 访问地址

- **管理后台**: https://your-project.vercel.app/
- **客户展示**: https://your-project.vercel.app/customer-view
- **内部通报**: https://your-project.vercel.app/internal-report

---

## 配置自定义域名（可选）

1. 访问 Vercel Dashboard: https://vercel.com/dashboard
2. 选择项目 → Settings → Domains
3. 添加您的域名
4. 按照提示配置 DNS

---

## 常见问题

**Q: 部署后页面空白？**
A: 检查环境变量是否正确配置

**Q: 如何更新？**
A: 运行 `vercel --prod` 即可

**Q: 如何查看日志？**
A: 访问 Vercel Dashboard → 选择项目 → Deployments

---

## 需要详细指南？

查看完整部署文档：`DEPLOYMENT_GUIDE.md`

---

## 技术支持

- Vercel 文档: https://vercel.com/docs
- Supabase 文档: https://supabase.com/docs
- 项目文档: 查看项目中的其他 .md 文件
