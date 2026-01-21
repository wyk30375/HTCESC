#!/bin/bash

# 恏淘车经营管理平台 - 快速部署脚本

echo "🚀 开始部署恏淘车经营管理平台..."
echo ""

# 检查 Node.js 版本
echo "📋 检查环境..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ 错误：需要 Node.js 18 或更高版本"
    echo "   当前版本：$(node -v)"
    exit 1
fi
echo "✅ Node.js 版本：$(node -v)"

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ 错误：未安装 pnpm"
    echo "   请运行：npm install -g pnpm"
    exit 1
fi
echo "✅ pnpm 版本：$(pnpm -v)"

# 检查环境变量文件
if [ ! -f ".env" ] && [ ! -f ".env.production" ]; then
    echo "⚠️  警告：未找到环境变量文件"
    echo "   请创建 .env 或 .env.production 文件"
    echo "   参考 .env.production.template 模板"
    read -p "是否继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 安装依赖
echo ""
echo "📦 安装依赖..."
pnpm install
if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi
echo "✅ 依赖安装完成"

# 代码检查
echo ""
echo "🔍 运行代码检查..."
pnpm run lint
if [ $? -ne 0 ]; then
    echo "⚠️  代码检查发现问题"
    read -p "是否继续部署？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo "✅ 代码检查通过"

# 构建项目
echo ""
echo "🔨 构建生产版本..."
pnpm run build
if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi
echo "✅ 构建完成"

# 显示构建结果
echo ""
echo "📊 构建结果："
du -sh dist
echo ""

# 选择部署方式
echo "🎯 选择部署方式："
echo "1) Vercel（推荐）"
echo "2) Netlify"
echo "3) 仅构建，不部署"
echo ""
read -p "请选择 (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 部署到 Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "📦 安装 Vercel CLI..."
            npm install -g vercel
        fi
        vercel --prod
        ;;
    2)
        echo ""
        echo "🚀 部署到 Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "📦 安装 Netlify CLI..."
            npm install -g netlify-cli
        fi
        netlify deploy --prod
        ;;
    3)
        echo ""
        echo "✅ 构建完成，dist 目录已准备就绪"
        echo "📁 构建输出：./dist"
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署流程完成！"
echo ""
echo "📚 更多信息请查看 DEPLOYMENT.md"
