# Cloudflare Pages 部署指南

## 方案 A：使用命令行部署（推荐）

### 前提条件
1. 有 Cloudflare 账号（免费注册：https://dash.cloudflare.com/sign-up）
2. 已安装 Node.js 和 npm

### 部署步骤

#### 1. 安装 Wrangler CLI（Cloudflare 官方工具）
```bash
npm install -g wrangler
```

#### 2. 登录 Cloudflare 账号
```bash
wrangler login
```
会自动打开浏览器，让你授权登录

#### 3. 运行部署脚本
```bash
chmod +x cloudflare-deploy.sh
./cloudflare-deploy.sh
```

或者手动执行：
```bash
# 构建项目
npm run build

# 部署到 Cloudflare Pages
wrangler pages deploy dist --project-name=scl90-test
```

#### 4. 配置环境变量
部署成功后，需要在 Cloudflare Dashboard 添加环境变量：

1. 访问：https://dash.cloudflare.com/
2. 进入 **Workers & Pages** → 选择你的项目 **scl90-test**
3. 点击 **Settings** → **Environment variables**
4. 添加以下变量：

   **Production 环境**：
   - `VITE_SUPABASE_URL` = `https://wmnnivvhbcffhjhjyedj.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtbm5pdnZoYmNmZmhqaGp5ZWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NzM3NTQsImV4cCI6MjA3ODI0OTc1NH0.cJGCMBTSIXA6jjibZAkqbwdhbRp7V6yNTjukYkWoYzo`

5. 保存后，**重新部署**项目（或者触发一次新部署）

#### 5. 访问你的网站
部署完成后会显示类似：
```
✨ Success! Deployed to https://scl90-test.pages.dev
```

---

## 方案 B：使用 GitHub 自动部署（推荐用于持续部署）

### 步骤

#### 1. 推送代码到 GitHub
代码已经在：https://github.com/leoliming123-commits/scl90-test005

#### 2. 连接 Cloudflare Pages 到 GitHub

1. 访问 Cloudflare Dashboard：https://dash.cloudflare.com/
2. 点击 **Workers & Pages**
3. 点击 **Create application** → **Pages** → **Connect to Git**
4. 选择 **GitHub**，授权 Cloudflare 访问你的仓库
5. 选择仓库：`leoliming123-commits/scl90-test005`
6. 配置构建设置：
   - **项目名称**：`scl90-test`（或任意名称）
   - **生产分支**：`main`
   - **构建命令**：`npm run build`
   - **构建输出目录**：`dist`
   - **Root 目录**：`/`（默认）

#### 3. 添加环境变量
在构建设置页面，展开 **Environment variables** 部分，添加：

- `VITE_SUPABASE_URL` = `https://wmnnivvhbcffhjhjyedj.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtbm5pdnZoYmNmZmhqaGp5ZWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NzM3NTQsImV4cCI6MjA3ODI0OTc1NH0.cJGCMBTSIXA6jjibZAkqbwdhbRp7V6yNTjukYkWoYzo`

#### 4. 保存并部署
点击 **Save and Deploy**

Cloudflare 会自动：
- 克隆你的仓库
- 运行 `npm install`
- 运行 `npm run build`
- 部署到全球 CDN

#### 5. 访问网站
部署完成后会显示网址，类似：
```
https://scl90-test.pages.dev
```

---

## 方案 C：手动上传构建产物

如果不想使用 CLI 或 GitHub，也可以手动上传：

1. 本地构建：
   ```bash
   npm run build
   ```

2. 访问 Cloudflare Dashboard → **Workers & Pages**
3. 点击 **Create application** → **Pages** → **Upload assets**
4. 输入项目名称：`scl90-test`
5. 拖拽 `dist` 文件夹到上传区域
6. 上传完成后，进入 **Settings** → **Environment variables** 添加环境变量
7. 重新上传一次以应用环境变量

---

## 自定义域名（可选）

部署后，你可以绑定自己的域名：

1. 在 Cloudflare Pages 项目页面，点击 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入你的域名（如 `scl90.yourdomain.com`）
4. 按照提示配置 DNS（如果域名在 Cloudflare，会自动配置）

---

## 优势

✅ **国内访问友好**：Cloudflare 在中国有 CDN 节点
✅ **免费且无限流量**：Cloudflare Pages 完全免费
✅ **自动 HTTPS**：自动配置 SSL 证书
✅ **全球 CDN**：300+ 全球边缘节点
✅ **每次 git push 自动部署**（如果使用 GitHub 集成）

---

## 常见问题

### Q: 环境变量不生效？
A: 添加环境变量后需要重新部署项目才能生效

### Q: 构建失败？
A: 检查 Node.js 版本（建议 18+），确保本地能成功 `npm run build`

### Q: 国内访问还是慢？
A: 可以考虑绑定自定义域名，并使用国内 DNS 服务商

---

## 需要帮助？

如果遇到问题，可以：
1. 查看 Cloudflare Pages 文档：https://developers.cloudflare.com/pages/
2. 查看构建日志（在 Cloudflare Dashboard 项目页面）
3. 检查浏览器控制台的错误信息
