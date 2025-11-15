#!/bin/bash

# SCL-90 测评系统 - Vercel 部署脚本

echo "🚀 准备部署到 Vercel..."

# 检查是否在 git 仓库中
if [ ! -d .git ]; then
    echo "❌ 错误：当前目录不是 Git 仓库"
    echo "请在你的项目根目录运行此脚本"
    exit 1
fi

# 添加所有更改
echo "📦 添加文件..."
git add .

# 提交更改
echo "💾 提交更改..."
git commit -m "实现多用户独立计时功能 - 一个访问码支持多人同时使用"

# 推送到远程仓库
echo "⬆️  推送到 GitHub..."
git push origin main || git push origin master

echo "✅ 推送完成！"
echo "⏳ Vercel 将在 1-2 分钟内自动部署..."
echo "📊 查看部署状态：https://vercel.com/dashboard"
