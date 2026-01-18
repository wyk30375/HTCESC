# 🚀 快速部署指南

## 最简单的部署方式（推荐）

### 使用一键部署脚本

```bash
./deploy.sh
```

脚本会自动完成：
1. ✅ 环境检查
2. ✅ 依赖安装
3. ✅ 代码检查
4. ✅ 项目构建
5. ✅ 选择部署平台

---

## 手动部署步骤

### 1. Vercel 部署（最推荐）

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署到生产环境
vercel --prod
```

**优势**：
- ✅ 零配置
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 免费额度充足

### 2. Netlify 部署

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录 Netlify
netlify login

# 部署到生产环境
netlify deploy --prod
```

---

## 环境变量配置

在部署平台（Vercel/Netlify）的环境变量设置中添加：

```
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
VITE_APP_ID=app-8u0242wc45c1
VITE_API_ENV=production
```

---

## 部署文件说明

- `vercel.json` - Vercel 部署配置
- `netlify.toml` - Netlify 部署配置
- `deploy.sh` - 一键部署脚本
- `.env.production.template` - 生产环境变量模板
- `DEPLOYMENT.md` - 完整部署文档
- `DEPLOYMENT_CHECKLIST.md` - 部署检查清单

---

## 需要帮助？

查看完整文档：[DEPLOYMENT.md](./DEPLOYMENT.md)

---

**祝您部署顺利！🎉**
