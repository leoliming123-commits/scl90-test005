#!/bin/bash

# Cloudflare Pages 部署脚本
# 使用说明：chmod +x cloudflare-deploy.sh && ./cloudflare-deploy.sh

echo "==================================="
echo "Cloudflare Pages 部署脚本"
echo "==================================="
echo ""

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ 未找到 wrangler CLI"
    echo "正在安装 wrangler..."
    npm install -g wrangler
fi

echo "✅ Wrangler CLI 已就绪"
echo ""

# 构建项目
echo "📦 开始构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建成功"
echo ""

# 部署到 Cloudflare Pages
echo "🚀 开始部署到 Cloudflare Pages..."
echo ""
echo "如果这是第一次部署，wrangler 会提示你登录 Cloudflare 账号"
echo ""

wrangler pages deploy dist --project-name=scl90-test

echo ""
echo "==================================="
echo "部署完成！"
echo "==================================="
