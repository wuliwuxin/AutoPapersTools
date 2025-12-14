# 部署问题解决方案

## 问题诊断

### 原始问题
在 Vercel 上部署后，前端可以访问，但 API 调用失败，报错：
```
Failed to execute 'json' on 'Response': Unexpected end of JSON input
```

### 根本原因

这是一个 **Express + tRPC 全栈应用**，Vercel Serverless Functions 对这类应用支持有限：

1. **架构不匹配**
   - 应用使用 Express 作为 HTTP 服务器
   - Vercel Serverless Functions 是无状态的函数执行环境
   - Express 需要持久连接，Serverless 每次请求都是独立的

2. **技术限制**
   - ⏱️ **10 秒超时**：复杂操作可能超时
   - 🔌 **无持久连接**：数据库连接池无法正常工作
   - ❄️ **冷启动**：首次请求慢，可能导致超时
   - 🔗 **连接限制**：并发连接数受限

3. **具体表现**
   - API 返回错误文本而不是 JSON
   - tRPC 批量请求处理失败
   - 数据库连接不稳定

## 解决方案

### ✅ 推荐方案：Vercel (前端) + Railway (后端)

这是最佳实践，将前端和后端分离部署：

#### 优点
- ✅ **前端快速**：Vercel 的全球 CDN 加速静态资源
- ✅ **后端稳定**：Railway 原生支持 Express 应用
- ✅ **无超时限制**：Railway 没有 10 秒限制
- ✅ **持久连接**：支持数据库连接池和 WebSocket
- ✅ **易于调试**：前后端日志分离，问题定位更容易
- ✅ **成本低**：两个平台都有免费套餐

#### 架构图
```
用户浏览器
    ↓
Vercel (React 前端)
https://auto-papers-tools.vercel.app
    ↓ CORS 跨域请求
Railway (Express 后端)
https://your-app.up.railway.app/api
    ↓
数据库 (PlanetScale/Railway PostgreSQL)
```

## 已完成的修改

### 1. 添加 CORS 支持

**文件：** `server/_core/index.ts`

```typescript
import cors from "cors";

app.use(cors({
  origin: (origin, callback) => {
    // 允许 Vercel 域名
    if (!origin || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    // 其他允许的域名
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // 允许 cookies
}));
```

### 2. 支持可配置的 API URL

**文件：** `client/src/main.tsx`

```typescript
const getApiUrl = () => {
  // 如果设置了 VITE_API_URL，使用它（Railway 后端）
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api/trpc`;
  }
  // 否则使用相对路径（本地开发）
  return "/api/trpc";
};
```

### 3. 创建 Railway 配置文件

**文件：** `railway.json`

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm run build"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**文件：** `Procfile`

```
web: node dist/index.js
```

### 4. 安装依赖

```bash
pnpm add cors
pnpm add -D @types/cors
```

### 5. 创建部署文档

- ✅ `RAILWAY_DEPLOYMENT.md` - Railway 详细部署指南
- ✅ `DEPLOYMENT_COMPLETE.md` - 完整部署流程
- ✅ `QUICK_DEPLOY_RAILWAY.md` - 5 分钟快速部署
- ✅ `DEPLOYMENT_SOLUTION.md` - 问题诊断和解决方案（本文档）

## 部署步骤

### 第一步：部署后端到 Railway

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 初始化项目
railway init

# 4. 设置环境变量
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=8db1ea44c4904b772127d241a5d3dabea273c51b6605c9e39e515d1d344dbf6f
railway variables set ENCRYPTION_KEY=kPaSUwAgZee2JcSTbLfyjqUTBu2GWrfVLis77ffNovQ=

# 5. 部署
railway up

# 6. 创建公开域名
railway domain create

# 7. 查看域名（记下这个 URL）
railway domain
```

### 第二步：更新 Vercel 配置

1. 访问 Vercel Dashboard
2. 选择 `auto-papers-tools` 项目
3. Settings → Environment Variables
4. 添加：
   ```
   VITE_API_URL = https://your-railway-app.up.railway.app
   ```
5. 重新部署：`vercel --prod`

### 第三步：测试

```bash
# 测试后端
curl https://your-railway-app.up.railway.app/api/health

# 访问前端
open https://auto-papers-tools.vercel.app
```

## 为什么不继续使用 Vercel Serverless？

### 尝试过的方案

1. **创建 `api/index.ts` Serverless Function**
   - ❌ Express 中间件在 Serverless 中运行不稳定
   - ❌ tRPC 批量请求处理失败
   - ❌ 连接池无法正常工作

2. **调整 `vercel.json` 配置**
   - ❌ 增加内存和超时时间仍然不够
   - ❌ 路由重写无法完全解决问题

3. **简化后端逻辑**
   - ❌ 应用架构复杂，无法简单拆分
   - ❌ 需要重写大量代码

### 结论

对于 Express + tRPC 这类全栈应用，**Vercel Serverless Functions 不是最佳选择**。

Railway 提供：
- ✅ 原生 Node.js 支持
- ✅ 无超时限制
- ✅ 持久连接
- ✅ 更好的性能
- ✅ 更容易调试

## 成本对比

### Vercel + Railway（推荐）

**Vercel（前端）：**
- 免费套餐：100 GB 带宽/月
- 无限部署
- 自动 HTTPS

**Railway（后端）：**
- 免费套餐：$5 额度/月
- 500 小时执行时间
- 100 GB 出站流量

**总计：** 对于个人项目，完全免费！

### 仅 Vercel（不推荐）

虽然免费，但：
- ❌ 功能不稳定
- ❌ 性能受限
- ❌ 难以调试
- ❌ 用户体验差

## 其他可选方案

### 方案 A：全部部署到 Railway

```bash
railway up
railway domain create
```

**优点：**
- 一个平台管理
- 配置简单

**缺点：**
- 前端没有 CDN 加速
- 静态资源加载较慢

### 方案 B：使用 Render

类似 Railway，也支持 Express 应用。

```bash
# 连接 GitHub 仓库
# 在 Render Dashboard 中配置
```

### 方案 C：使用 Fly.io

更接近传统服务器，适合复杂应用。

```bash
fly launch
fly deploy
```

## 总结

### 问题
- Vercel Serverless Functions 不适合 Express + tRPC 应用
- API 调用失败，返回错误而不是 JSON

### 解决方案
- ✅ 前端部署到 Vercel（已完成）
- ✅ 后端部署到 Railway（需要执行）
- ✅ 通过 CORS 连接前后端
- ✅ 使用环境变量配置 API URL

### 下一步
1. 按照 `QUICK_DEPLOY_RAILWAY.md` 部署后端
2. 在 Vercel 中添加 `VITE_API_URL` 环境变量
3. 重新部署 Vercel
4. 测试完整功能

### 预期结果
- ✅ 前端：https://auto-papers-tools.vercel.app
- ✅ 后端：https://your-app.up.railway.app
- ✅ 完整功能：注册、登录、获取论文、数据持久化
- ✅ 稳定性能：无超时、无连接问题

## 需要帮助？

查看详细文档：
- [快速部署](./QUICK_DEPLOY_RAILWAY.md)
- [完整指南](./DEPLOYMENT_COMPLETE.md)
- [Railway 文档](./RAILWAY_DEPLOYMENT.md)
