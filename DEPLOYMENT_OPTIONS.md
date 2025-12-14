# 部署选项说明

由于这是一个全栈应用（Express + React），在 Vercel 上部署有一些限制。

## 当前状态

- ✅ 前端已成功部署
- ⚠️ 后端 API 在 Serverless Functions 中可能有问题

## 推荐的部署方案

### 方案 A：分离部署（推荐）⭐

**前端**: Vercel
**后端**: Railway / Render / Fly.io

**优点**:
- 前端快速加载（Vercel CDN）
- 后端稳定运行（专门的服务器）
- 更容易调试和维护

**步骤**:
1. 保持前端在 Vercel
2. 后端部署到 Railway:
   ```bash
   # 安装 Railway CLI
   npm install -g @railway/cli
   
   # 登录
   railway login
   
   # 部署
   railway up
   ```
3. 更新前端 API 地址指向 Railway

### 方案 B：全部部署到 Railway

**优点**:
- 一个平台管理
- 支持完整的 Node.js 应用
- 免费套餐足够使用

**步骤**:
```bash
railway login
railway init
railway up
```

### 方案 C：继续使用 Vercel（需要调整）

**限制**:
- Serverless Functions 有 10 秒超时
- 不支持长连接
- 数据库连接池受限

**如果坚持使用 Vercel**:
1. 简化后端逻辑
2. 使用 Vercel 的 Edge Functions
3. 配置外部数据库

## 当前 Vercel 部署的功能

### ✅ 可用
- 前端界面
- 静态资源加载
- 客户端路由

### ❌ 可能不可用
- 用户注册/登录（需要后端 API）
- 从 arXiv 获取论文（需要后端 API）
- 数据持久化（需要后端 API）

## 建议

我强烈建议使用**方案 A**：
- 前端继续在 Vercel（已经部署好了）
- 后端部署到 Railway（5 分钟搞定）

这样可以获得最佳性能和稳定性。

需要我帮你配置 Railway 部署吗？
