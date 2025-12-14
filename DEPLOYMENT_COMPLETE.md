# 完整部署指南 - Vercel + Railway

本指南将帮助你完成完整的部署：前端部署到 Vercel，后端部署到 Railway。

## 🎯 部署架构

```
用户浏览器
    ↓
Vercel (前端 React)
https://auto-papers-tools.vercel.app
    ↓
Railway (后端 Express + tRPC)
https://your-app.up.railway.app/api
    ↓
数据库 (可选)
```

## 📋 前置条件

- ✅ GitHub 账号
- ✅ 项目已推送到 GitHub
- ✅ Node.js 和 pnpm 已安装

## 🚀 第一步：部署后端到 Railway

### 1.1 安装 Railway CLI

```bash
npm install -g @railway/cli
```

### 1.2 登录 Railway

```bash
railway login
```

使用 GitHub 账号登录。

### 1.3 初始化项目

在项目根目录运行：

```bash
railway init
```

- Project name: `AutoPapersTools-Backend`
- 选择 "Empty Project"

### 1.4 添加环境变量

```bash
# 设置环境变量
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=8db1ea44c4904b772127d241a5d3dabea273c51b6605c9e39e515d1d344dbf6f
railway variables set ENCRYPTION_KEY=kPaSUwAgZee2JcSTbLfyjqUTBu2GWrfVLis77ffNovQ=
```

### 1.5 部署后端

```bash
railway up
```

等待部署完成（约 2-3 分钟）。

### 1.6 创建公开域名

```bash
railway domain
```

如果没有域名，创建一个：

```bash
railway domain create
```

你会得到一个 URL，类似：
```
https://autopapertools-backend-production.up.railway.app
```

**重要：记下这个 URL，下一步需要用到！**

### 1.7 测试后端

```bash
# 测试健康检查（替换为你的 Railway URL）
curl https://your-railway-app.up.railway.app/api/health
```

应该返回：
```json
{"status":"ok"}
```

## 🌐 第二步：更新 Vercel 前端

### 2.1 添加 API URL 环境变量

访问 [Vercel Dashboard](https://vercel.com/dashboard)：

1. 选择 `auto-papers-tools` 项目
2. 进入 **Settings** → **Environment Variables**
3. 添加新变量：

```
Name: VITE_API_URL
Value: https://your-railway-app.up.railway.app
```

**注意：** 
- 不要在 URL 末尾加 `/api/trpc`
- 只需要 Railway 的基础 URL
- 例如：`https://autopapertools-backend-production.up.railway.app`

4. 选择所有环境：Production, Preview, Development
5. 点击 "Save"

### 2.2 重新部署 Vercel

有两种方式：

**方式 1：通过 Dashboard**
1. 在 Vercel Dashboard 中选择项目
2. 进入 "Deployments" 标签
3. 点击最新部署右侧的 "..." 菜单
4. 选择 "Redeploy"

**方式 2：通过 CLI**
```bash
vercel --prod
```

### 2.3 等待部署完成

部署通常需要 1-2 分钟。

## ✅ 第三步：测试完整功能

### 3.1 访问应用

打开浏览器访问：
```
https://auto-papers-tools.vercel.app
```

### 3.2 测试用户注册

1. 点击 "注册" 按钮
2. 填写用户名、邮箱、密码
3. 点击 "注册"
4. 如果成功，说明前后端连接正常！

### 3.3 测试登录

1. 使用刚注册的账号登录
2. 登录成功后进入主页

### 3.4 测试 API 功能

1. 进入 "个人中心" 或 "API Keys" 页面
2. 配置你的 API 密钥（DeepSeek/OpenAI 等）
3. 进入 "获取论文" 页面
4. 尝试从 arXiv 获取论文

如果所有功能都正常，恭喜！部署成功！🎉

## 🔧 配置数据库（可选）

如果不配置数据库，应用会使用内存存储（重启后数据丢失）。

### 选项 1：使用 Railway PostgreSQL

```bash
# 添加 PostgreSQL 服务
railway add postgresql
```

Railway 会自动设置 `DATABASE_URL` 环境变量。

### 选项 2：使用 PlanetScale MySQL

1. 访问 https://planetscale.com/
2. 创建免费数据库
3. 获取连接字符串
4. 在 Railway 中添加：

```bash
railway variables set DATABASE_URL="your-planetscale-connection-string"
```

### 运行数据库迁移

```bash
railway run pnpm run db:push
```

## 📊 监控和维护

### 查看 Railway 日志

```bash
# 实时日志
railway logs

# 查看最近的日志
railway logs --tail 100
```

### 查看 Vercel 日志

1. 访问 Vercel Dashboard
2. 选择项目
3. 进入 "Deployments" 标签
4. 点击具体部署查看日志

## 🔄 自动部署

### Railway 自动部署

1. 在 Railway Dashboard 中选择项目
2. 进入 "Settings" → "Service"
3. 连接 GitHub 仓库
4. 选择分支（`main`）

配置完成后，推送到 `main` 分支会自动部署后端。

### Vercel 自动部署

Vercel 已经自动连接了 GitHub，推送到 `main` 分支会自动部署前端。

## 🐛 故障排除

### 问题 1：前端显示 "Failed to fetch"

**原因：** 前端无法连接后端

**解决：**
1. 检查 Railway 应用是否正在运行：
   ```bash
   railway status
   ```

2. 检查 Vercel 的 `VITE_API_URL` 是否正确：
   - 访问 Vercel Dashboard
   - Settings → Environment Variables
   - 确认 URL 正确

3. 测试后端健康检查：
   ```bash
   curl https://your-railway-app.up.railway.app/api/health
   ```

### 问题 2：CORS 错误

**原因：** 跨域请求被阻止

**解决：**
后端已经配置了 CORS，但如果还有问题：

1. 检查 Railway 日志：
   ```bash
   railway logs
   ```

2. 确认 Vercel 域名在 CORS 允许列表中（已自动配置）

### 问题 3：用户注册失败

**原因：** 环境变量未设置

**解决：**
1. 检查 Railway 环境变量：
   ```bash
   railway variables
   ```

2. 确认 `JWT_SECRET` 和 `ENCRYPTION_KEY` 已设置

3. 如果缺失，重新添加：
   ```bash
   railway variables set JWT_SECRET=8db1ea44c4904b772127d241a5d3dabea273c51b6605c9e39e515d1d344dbf6f
   railway variables set ENCRYPTION_KEY=kPaSUwAgZee2JcSTbLfyjqUTBu2GWrfVLis77ffNovQ=
   ```

### 问题 4：Railway 构建失败

**原因：** 依赖安装或构建错误

**解决：**
1. 查看构建日志：
   ```bash
   railway logs --build
   ```

2. 本地测试构建：
   ```bash
   pnpm run build
   ```

3. 如果本地构建成功，重新部署：
   ```bash
   railway up --force
   ```

## 💰 成本估算

### Railway 免费套餐
- ✅ $5 免费额度/月
- ✅ 500 小时执行时间
- ✅ 100 GB 出站流量

### Vercel 免费套餐
- ✅ 无限部署
- ✅ 100 GB 带宽/月
- ✅ 自动 HTTPS

**总计：** 对于个人项目，完全免费！

## 📚 相关文档

- [Railway 详细部署指南](./RAILWAY_DEPLOYMENT.md)
- [Vercel 部署指南](./VERCEL_DEPLOYMENT.md)
- [部署选项说明](./DEPLOYMENT_OPTIONS.md)

## 🎉 完成！

现在你的应用已经完全部署：

- ✅ 前端：https://auto-papers-tools.vercel.app
- ✅ 后端：https://your-railway-app.up.railway.app
- ✅ 完整功能：注册、登录、获取论文、数据持久化
- ✅ 自动部署：推送代码自动更新

享受你的全栈应用吧！🚀

## 需要帮助？

如果遇到问题：
1. 查看本文档的故障排除部分
2. 查看 Railway 日志：`railway logs`
3. 查看 Vercel 部署日志
4. 在 GitHub Issues 中提问
