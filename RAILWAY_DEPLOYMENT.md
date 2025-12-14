# Railway 后端部署指南

本指南说明如何将后端 API 部署到 Railway，配合 Vercel 前端使用。

## 为什么使用 Railway？

- ✅ **完美支持 Express**：原生支持 Node.js 全栈应用
- ✅ **无超时限制**：不像 Vercel Serverless 有 10 秒限制
- ✅ **持久连接**：支持数据库连接池和 WebSocket
- ✅ **免费套餐**：每月 $5 免费额度（足够个人项目）
- ✅ **自动部署**：Git 推送自动触发部署
- ✅ **内置数据库**：可选 PostgreSQL/MySQL/Redis

## 快速部署步骤

### 1. 安装 Railway CLI

```bash
npm install -g @railway/cli
```

### 2. 登录 Railway

```bash
railway login
```

选择使用 GitHub 账号登录。

### 3. 初始化项目

在项目根目录运行：

```bash
railway init
```

按照提示操作：
- Project name: `AutoPapersTools-Backend`
- 选择 "Empty Project"

### 4. 添加环境变量

```bash
# 添加 JWT 密钥
railway variables set JWT_SECRET=8db1ea44c4904b772127d241a5d3dabea273c51b6605c9e39e515d1d344dbf6f

# 添加加密密钥
railway variables set ENCRYPTION_KEY=kPaSUwAgZee2JcSTbLfyjqUTBu2GWrfVLis77ffNovQ=

# 设置 Node 环境
railway variables set NODE_ENV=production
```

或者在 Railway Dashboard 中添加：
1. 访问 https://railway.app/dashboard
2. 选择项目
3. 进入 "Variables" 标签
4. 添加上述变量

### 5. 部署

```bash
railway up
```

部署完成后，Railway 会自动生成一个 URL，如：
```
https://autopapertools-backend-production.up.railway.app
```

### 6. 获取部署 URL

```bash
railway domain
```

如果没有域名，创建一个：

```bash
# 生成 Railway 提供的域名
railway domain create
```

记下这个 URL，我们需要在 Vercel 前端中配置它。

## 配置前端连接后端

### 更新 Vercel 环境变量

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择 `auto-papers-tools` 项目
3. 进入 **Settings** → **Environment Variables**
4. 添加新变量：

```bash
VITE_API_URL=https://your-railway-app.up.railway.app
```

将 `your-railway-app.up.railway.app` 替换为你的 Railway URL。

5. 重新部署 Vercel：

```bash
vercel --prod
```

## 配置数据库（可选）

### 选项 1：使用 Railway PostgreSQL

Railway 提供内置的 PostgreSQL 数据库：

```bash
# 添加 PostgreSQL 服务
railway add postgresql
```

Railway 会自动设置 `DATABASE_URL` 环境变量。

### 选项 2：使用 Railway MySQL

```bash
# 添加 MySQL 服务
railway add mysql
```

### 选项 3：使用外部数据库

如果你已经有 PlanetScale 或其他数据库：

```bash
railway variables set DATABASE_URL="your-database-connection-string"
```

## 运行数据库迁移

如果使用数据库，需要运行迁移：

```bash
# 连接到 Railway 环境
railway run pnpm run db:push
```

## 监控和日志

### 查看实时日志

```bash
railway logs
```

### 在 Dashboard 中查看

1. 访问 Railway Dashboard
2. 选择项目
3. 查看 "Deployments" 标签
4. 点击具体部署查看日志

## 自动部署

### 连接 GitHub 仓库

1. 在 Railway Dashboard 中选择项目
2. 进入 "Settings" → "Service"
3. 连接 GitHub 仓库
4. 选择分支（通常是 `main`）

配置完成后：
- 推送到 `main` 分支 → 自动部署
- 自动构建和重启

## 自定义域名（可选）

### 添加自定义域名

1. 在 Railway Dashboard 中选择项目
2. 进入 "Settings" → "Domains"
3. 点击 "Add Domain"
4. 输入你的域名（如 `api.example.com`）
5. 按照提示配置 DNS 记录

### DNS 配置

在你的域名提供商处添加 CNAME 记录：

```
类型    名称    值
CNAME   api     your-app.up.railway.app
```

## 环境变量完整列表

### 必需的环境变量

```bash
NODE_ENV=production
JWT_SECRET=8db1ea44c4904b772127d241a5d3dabea273c51b6605c9e39e515d1d344dbf6f
ENCRYPTION_KEY=kPaSUwAgZee2JcSTbLfyjqUTBu2GWrfVLis77ffNovQ=
```

### 可选的环境变量

```bash
# 数据库连接
DATABASE_URL=mysql://user:password@host:3306/database

# API 密钥（系统默认，用户可以在界面中配置自己的）
DEEPSEEK_API_KEY=sk-your-api-key
OPENAI_API_KEY=sk-your-api-key
ANTHROPIC_API_KEY=sk-your-api-key
GOOGLE_API_KEY=your-api-key

# 端口（Railway 自动设置）
PORT=3000
```

## 成本估算

### 免费套餐

- ✅ $5 免费额度/月
- ✅ 500 小时执行时间
- ✅ 100 GB 出站流量
- ✅ 自动 HTTPS
- ✅ 自定义域名

对于个人项目和小型应用，免费套餐完全够用。

### 升级到 Pro

如果需要更多资源：
- $20/月起
- 更多执行时间
- 更多流量
- 优先支持

## 故障排除

### 问题：构建失败

**检查：**
```bash
# 查看构建日志
railway logs --build

# 本地测试构建
pnpm run build
```

**常见原因：**
- 依赖安装失败
- TypeScript 编译错误
- 环境变量缺失

### 问题：应用启动失败

**检查：**
```bash
# 查看运行日志
railway logs

# 检查环境变量
railway variables
```

**常见原因：**
- `PORT` 环境变量未设置（Railway 自动设置）
- 数据库连接失败
- 必需的环境变量缺失

### 问题：前端无法连接后端

**检查：**
1. 确认 Railway 应用正在运行
2. 确认域名配置正确
3. 确认 Vercel 的 `VITE_API_URL` 设置正确
4. 检查 CORS 配置

**测试后端：**
```bash
# 测试健康检查
curl https://your-railway-app.up.railway.app/api/health

# 应该返回
{"status":"ok"}
```

### 问题：CORS 错误

如果前端报 CORS 错误，需要在后端配置 CORS：

后端代码已经配置了 CORS，但如果还有问题，检查：
1. Vercel 域名是否在允许列表中
2. Railway URL 是否正确

## 完整部署架构

```
用户浏览器
    ↓
Vercel (前端)
https://auto-papers-tools.vercel.app
    ↓
Railway (后端 API)
https://autopapertools-backend.up.railway.app/api
    ↓
数据库 (PlanetScale/Railway PostgreSQL)
```

## 与 Vercel Serverless 对比

| 功能 | Vercel Serverless | Railway |
|------|------------------|---------|
| Express 支持 | ⚠️ 有限 | ✅ 完整 |
| 超时限制 | ❌ 10 秒 | ✅ 无限制 |
| 持久连接 | ❌ | ✅ |
| 数据库连接池 | ⚠️ 受限 | ✅ |
| WebSocket | ❌ | ✅ |
| 冷启动 | ⚠️ 慢 | ✅ 快 |
| 价格 | 免费 | $5/月免费额度 |

## 推荐工作流

### 开发流程

1. **本地开发**
   ```bash
   pnpm run dev
   ```

2. **推送到 GitHub**
   ```bash
   git push origin main
   ```

3. **自动部署**
   - Railway 自动构建后端
   - Vercel 自动构建前端

4. **测试**
   - 访问 Vercel URL 测试前端
   - 检查 Railway 日志确认后端正常

## 相关资源

- [Railway 文档](https://docs.railway.app/)
- [Railway CLI 文档](https://docs.railway.app/develop/cli)
- [项目 GitHub 仓库](https://github.com/wuliwuxin/AutoPapersTools)

## 获取帮助

- [Railway Discord](https://discord.gg/railway)
- [Railway 社区](https://help.railway.app/)
- [项目 Issues](https://github.com/wuliwuxin/AutoPapersTools/issues)

## 下一步

部署完成后：
1. ✅ 后端运行在 Railway
2. ✅ 前端运行在 Vercel
3. ✅ 完整功能可用（注册、登录、获取论文等）
4. ✅ 数据持久化（如果配置了数据库）

现在你可以：
- 注册用户账号
- 配置 API 密钥
- 从 arXiv 获取论文
- 使用所有功能
