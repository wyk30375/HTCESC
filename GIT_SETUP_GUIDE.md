# 恏淘车 - Git 仓库配置与自动部署指南

## 📚 目录

- [为什么使用 Git 自动部署](#为什么使用-git-自动部署)
- [准备工作](#准备工作)
- [方案一：GitHub + Vercel 自动部署（推荐）](#方案一github--vercel-自动部署推荐)
- [方案二：GitLab + Vercel 自动部署](#方案二gitlab--vercel-自动部署)
- [配置 Vercel 自动部署](#配置-vercel-自动部署)
- [工作流程](#工作流程)
- [常见问题](#常见问题)
- [最佳实践](#最佳实践)

---

## 🎯 为什么使用 Git 自动部署？

### ✅ 优势

1. **自动化部署**
   - 代码推送后自动构建和部署
   - 无需手动执行部署命令
   - 节省时间和精力

2. **版本控制**
   - 完整的代码历史记录
   - 轻松回滚到任意版本
   - 团队协作更方便

3. **预览部署**
   - 每个分支自动生成预览链接
   - 测试新功能不影响生产环境
   - Pull Request 自动部署预览

4. **持续集成**
   - 自动运行测试
   - 自动检查代码质量
   - 确保代码质量

---

## 📋 准备工作

### 1. 检查项目状态

```bash
# 确保代码通过 lint 检查
cd /workspace/app-8u0242wc45c1
npm run lint
```

### 2. 创建 .gitignore 文件

确保项目根目录有 `.gitignore` 文件：

```bash
# 查看 .gitignore
cat .gitignore
```

应该包含以下内容：

```gitignore
# 依赖
node_modules/
.pnp
.pnp.js

# 测试
coverage/

# 生产构建
dist/
build/

# 环境变量（重要：不要提交到 Git）
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 日志
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# 编辑器
.vscode/
.idea/
*.swp
*.swo
*~

# 操作系统
.DS_Store
Thumbs.db

# Vercel
.vercel

# 其他
.cache/
.temp/
.vite/
```

### 3. 注册 Git 托管平台账号

选择以下之一：

- **GitHub**: https://github.com （推荐）
- **GitLab**: https://gitlab.com

---

## 🚀 方案一：GitHub + Vercel 自动部署（推荐）

### 步骤 1：初始化 Git 仓库

```bash
# 进入项目目录
cd /workspace/app-8u0242wc45c1

# 初始化 Git 仓库（如果还没有）
git init

# 配置用户信息
git config user.name "您的名字"
git config user.email "您的邮箱"

# 添加所有文件
git add .

# 提交代码
git commit -m "初始提交：恏淘车二手车运营管理平台"
```

### 步骤 2：在 GitHub 创建仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `haotaocar-platform`
   - **Description**: `恏淘车二手车运营管理平台`
   - **Visibility**: 
     - `Private`（推荐，代码私有）
     - `Public`（公开，任何人可见）
3. **不要**勾选 "Initialize this repository with a README"
4. 点击 **Create repository**

### 步骤 3：推送代码到 GitHub

```bash
# 添加远程仓库（替换 YOUR_USERNAME 为您的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/haotaocar-platform.git

# 推送代码到 main 分支
git branch -M main
git push -u origin main
```

如果需要输入密码，使用 **Personal Access Token**：

1. 访问 https://github.com/settings/tokens
2. 点击 **Generate new token** → **Generate new token (classic)**
3. 设置权限：
   - `repo` - 完整的仓库访问权限
4. 点击 **Generate token**
5. 复制生成的 token（只显示一次）
6. 在推送时使用 token 作为密码

### 步骤 4：连接 Vercel 和 GitHub

#### 方式一：通过 Vercel Dashboard（推荐）

1. 访问 https://vercel.com/dashboard
2. 点击 **Add New** → **Project**
3. 点击 **Import Git Repository**
4. 如果是第一次，点击 **Connect GitHub Account**
5. 授权 Vercel 访问您的 GitHub 账号
6. 选择 `haotaocar-platform` 仓库
7. 点击 **Import**
8. 配置项目：
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
9. 添加环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_ID`
   - `VITE_API_ENV`
10. 点击 **Deploy**

#### 方式二：通过 Vercel CLI

```bash
# 登录 Vercel
vercel login

# 连接 Git 仓库
vercel --prod

# 按照提示操作，选择连接 GitHub 仓库
```

### 步骤 5：验证自动部署

```bash
# 修改一个文件测试自动部署
echo "# 测试自动部署" >> README.md

# 提交并推送
git add README.md
git commit -m "测试：验证自动部署"
git push

# 访问 Vercel Dashboard 查看自动部署进度
```

---

## 🔧 方案二：GitLab + Vercel 自动部署

### 步骤 1：初始化 Git 仓库

```bash
# 进入项目目录
cd /workspace/app-8u0242wc45c1

# 初始化 Git 仓库（如果还没有）
git init

# 配置用户信息
git config user.name "您的名字"
git config user.email "您的邮箱"

# 添加所有文件
git add .

# 提交代码
git commit -m "初始提交：恏淘车二手车运营管理平台"
```

### 步骤 2：在 GitLab 创建仓库

1. 访问 https://gitlab.com/projects/new
2. 选择 **Create blank project**
3. 填写项目信息：
   - **Project name**: `恏淘车运营管理平台`
   - **Project URL**: `haotaocar-platform`
   - **Visibility Level**: 
     - `Private`（推荐，代码私有）
     - `Public`（公开，任何人可见）
4. **不要**勾选 "Initialize repository with a README"
5. 点击 **Create project**

### 步骤 3：推送代码到 GitLab

```bash
# 添加远程仓库（替换 YOUR_USERNAME 为您的 GitLab 用户名）
git remote add origin https://gitlab.com/YOUR_USERNAME/haotaocar-platform.git

# 推送代码到 main 分支
git branch -M main
git push -u origin main
```

### 步骤 4：连接 Vercel 和 GitLab

1. 访问 https://vercel.com/dashboard
2. 点击 **Add New** → **Project**
3. 点击 **Import Git Repository**
4. 点击 **Connect GitLab Account**
5. 授权 Vercel 访问您的 GitLab 账号
6. 选择 `haotaocar-platform` 仓库
7. 点击 **Import**
8. 配置项目（同 GitHub 方式）
9. 点击 **Deploy**

---

## ⚙️ 配置 Vercel 自动部署

### 1. 生产分支设置

默认情况下，`main` 分支的推送会触发生产部署。

**修改生产分支**：

1. Vercel Dashboard → 选择项目
2. **Settings** → **Git**
3. **Production Branch**: 选择或输入分支名称
4. 点击 **Save**

### 2. 预览部署设置

**启用预览部署**：

1. Vercel Dashboard → 选择项目
2. **Settings** → **Git**
3. **Deploy Previews**: 
   - `All branches` - 所有分支都生成预览
   - `Only production branch` - 仅生产分支
4. 点击 **Save**

### 3. 自动部署触发条件

Vercel 会在以下情况自动部署：

- ✅ 推送到生产分支（如 `main`）
- ✅ 推送到其他分支（生成预览链接）
- ✅ 创建或更新 Pull Request
- ✅ 合并 Pull Request

### 4. 禁用自动部署

如果需要暂时禁用自动部署：

1. Vercel Dashboard → 选择项目
2. **Settings** → **Git**
3. **Ignored Build Step**: 添加条件
   ```bash
   # 示例：跳过包含 [skip ci] 的提交
   git log -1 --pretty=%B | grep -q "\[skip ci\]"
   ```

---

## 🔄 工作流程

### 日常开发流程

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 创建新分支开发新功能
git checkout -b feature/new-feature

# 3. 修改代码
# ... 编辑文件 ...

# 4. 提交代码
git add .
git commit -m "feat: 添加新功能"

# 5. 推送到远程仓库
git push origin feature/new-feature

# 6. 在 GitHub/GitLab 创建 Pull Request
# Vercel 会自动为这个 PR 生成预览链接

# 7. 代码审查通过后，合并到 main 分支
# Vercel 会自动部署到生产环境
```

### 紧急修复流程

```bash
# 1. 从 main 分支创建 hotfix 分支
git checkout main
git pull origin main
git checkout -b hotfix/urgent-fix

# 2. 修复问题
# ... 编辑文件 ...

# 3. 提交并推送
git add .
git commit -m "fix: 紧急修复 XXX 问题"
git push origin hotfix/urgent-fix

# 4. 创建 Pull Request 并快速合并
# 或直接合并到 main
git checkout main
git merge hotfix/urgent-fix
git push origin main

# Vercel 会自动部署修复
```

### 回滚流程

```bash
# 方式一：通过 Git 回滚
git revert HEAD
git push origin main

# 方式二：通过 Vercel Dashboard 回滚
# Dashboard → Deployments → 选择版本 → Promote to Production
```

---

## ❓ 常见问题

### Q: 推送代码后没有自动部署？

**A: 检查以下几点：**

1. **确认 Vercel 已连接 Git 仓库**
   - Dashboard → 项目 → Settings → Git
   - 确认显示已连接的仓库

2. **检查分支设置**
   - 确认推送的分支是生产分支
   - 或确认预览部署已启用

3. **查看构建日志**
   - Dashboard → Deployments
   - 查看是否有构建失败

4. **检查 Ignored Build Step**
   - Settings → Git → Ignored Build Step
   - 确认没有设置跳过构建的条件

### Q: 如何在提交时跳过自动部署？

**A: 在提交信息中添加 `[skip ci]`：**

```bash
git commit -m "docs: 更新文档 [skip ci]"
git push
```

需要在 Vercel 中配置 Ignored Build Step：

```bash
git log -1 --pretty=%B | grep -q "\[skip ci\]"
```

### Q: 如何保护环境变量不被提交到 Git？

**A: 确保 `.env` 文件在 `.gitignore` 中：**

```bash
# 检查 .gitignore
cat .gitignore | grep .env

# 如果没有，添加
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore

# 如果已经提交了 .env 文件，从 Git 中删除
git rm --cached .env
git commit -m "chore: 移除环境变量文件"
git push
```

### Q: 如何设置不同环境的环境变量？

**A: 在 Vercel Dashboard 中为不同环境设置：**

1. Dashboard → 项目 → Settings → Environment Variables
2. 添加变量时选择环境：
   - **Production** - 生产环境
   - **Preview** - 预览环境
   - **Development** - 开发环境

### Q: 多人协作时如何避免冲突？

**A: 遵循以下最佳实践：**

1. **经常拉取最新代码**
   ```bash
   git pull origin main
   ```

2. **使用功能分支**
   ```bash
   git checkout -b feature/my-feature
   ```

3. **小步提交**
   ```bash
   git add .
   git commit -m "feat: 完成 XXX 功能的一部分"
   ```

4. **合并前先更新**
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/my-feature
   git merge main
   # 解决冲突
   git push origin feature/my-feature
   ```

### Q: 如何查看部署历史？

**A: 通过 Vercel Dashboard：**

1. Dashboard → 项目 → Deployments
2. 查看所有部署记录
3. 点击具体部署查看：
   - 构建日志
   - 部署时间
   - Git 提交信息
   - 预览链接

---

## 💡 最佳实践

### 1. 提交信息规范

使用语义化提交信息：

```bash
# 新功能
git commit -m "feat: 添加车辆评估功能"

# 修复 bug
git commit -m "fix: 修复销售记录显示错误"

# 文档更新
git commit -m "docs: 更新部署指南"

# 代码重构
git commit -m "refactor: 优化车辆列表查询性能"

# 样式调整
git commit -m "style: 调整车辆卡片样式"

# 测试
git commit -m "test: 添加销售管理单元测试"

# 构建/工具
git commit -m "chore: 更新依赖包"
```

### 2. 分支管理策略

```
main (生产分支)
  ├── develop (开发分支)
  │   ├── feature/vehicle-management (功能分支)
  │   ├── feature/sales-report (功能分支)
  │   └── feature/employee-management (功能分支)
  └── hotfix/urgent-bug-fix (紧急修复分支)
```

### 3. Pull Request 流程

1. **创建 PR 时**：
   - 填写清晰的标题和描述
   - 关联相关的 Issue
   - 添加截图或演示

2. **代码审查**：
   - 至少一人审查
   - 检查代码质量
   - 测试预览链接

3. **合并前**：
   - 确保所有检查通过
   - 解决所有评论
   - 更新文档

### 4. 环境变量管理

```bash
# 开发环境 (.env.local)
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-key
VITE_API_ENV=development

# 生产环境 (Vercel Dashboard)
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-key
VITE_API_ENV=production
```

### 5. 定期维护

```bash
# 每周
- 拉取最新代码
- 更新依赖包
- 检查安全漏洞

# 每月
- 清理无用分支
- 审查代码质量
- 更新文档

# 每季度
- 重大版本升级
- 性能优化
- 安全审计
```

---

## 🎯 快速开始

### 新项目设置

```bash
# 1. 初始化 Git
cd /workspace/app-8u0242wc45c1
git init
git add .
git commit -m "初始提交：恏淘车二手车运营管理平台"

# 2. 创建 GitHub 仓库
# 访问 https://github.com/new

# 3. 推送代码
git remote add origin https://github.com/YOUR_USERNAME/haotaocar-platform.git
git branch -M main
git push -u origin main

# 4. 连接 Vercel
# 访问 https://vercel.com/dashboard
# Import Git Repository → 选择仓库 → Deploy

# 5. 测试自动部署
echo "# 测试" >> README.md
git add README.md
git commit -m "test: 测试自动部署"
git push
```

### 现有项目迁移

```bash
# 1. 检查当前 Git 状态
git status

# 2. 如果有未提交的更改，先提交
git add .
git commit -m "chore: 迁移前的代码整理"

# 3. 添加新的远程仓库
git remote add github https://github.com/YOUR_USERNAME/haotaocar-platform.git

# 4. 推送到新仓库
git push github main

# 5. 在 Vercel 中连接新仓库
# Dashboard → Settings → Git → Connect Git Repository
```

---

## 📞 技术支持

### 官方文档

- **GitHub**: https://docs.github.com
- **GitLab**: https://docs.gitlab.com
- **Vercel Git Integration**: https://vercel.com/docs/git

### 相关文档

- **Vercel 部署指南**: `VERCEL_DEPLOYMENT.md`
- **快速部署指南**: `QUICK_DEPLOY.md`
- **完整部署指南**: `DEPLOYMENT_GUIDE.md`
- **部署文档导航**: `DEPLOYMENT_INDEX.md`

---

## 🎉 总结

### Git 自动部署的优势

1. ✅ **自动化** - 推送代码自动部署
2. ✅ **版本控制** - 完整的代码历史
3. ✅ **团队协作** - 多人开发更方便
4. ✅ **预览部署** - 每个分支独立预览
5. ✅ **快速回滚** - 一键回滚到任意版本

### 推荐工作流

```
开发 → 提交 → 推送 → 自动部署 → 测试 → 上线
```

### 下一步

1. ✅ 创建 Git 仓库
2. ✅ 推送代码
3. ✅ 连接 Vercel
4. ✅ 测试自动部署
5. ✅ 配置团队协作

---

**祝您使用愉快！🚀**

有任何问题，请查看相关文档或联系技术支持。
