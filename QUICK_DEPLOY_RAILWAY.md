# 🚀 快速部署 - 5 分钟搞定

## 第一步：部署后端到 Railway

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 初始化项目
railway init
# 输入项目名: AutoPapersTools-Backend

# 4. 设置环境变量
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=8db1ea44c4904b772127d241a5d3dabea273c51b6605c9e39e515d1d344dbf6f
railway variables set ENCRYPTION_KEY=kPaSUwAgZee2JcSTbLfyjqUTBu2GWrfVLis77ffNovQ=

# 5. 部署
railway up

# 6. 创建公开域名
railway domain create

# 7. 查看域名（记下这个 URL！）
railway domain
```

你会得到类似这样的 URL：
```
https://autopapertools-backend-production.up.railway.app
```

## 第二步：更新 Vercel 前端

### 方式 1：通过 Dashboard（推荐）

1. 访问 https://vercel.com/dashboard
2. 选择 `auto-papers-tools` 项目
3. Settings → Environment Variables
4. 添加变量：
   ```
   Name: VITE_API_URL
   Value: https://your-railway-app.up.railway.app
   ```
   （替换为你的 Railway URL）
5. 选择所有环境（Production, Preview, Development）
6. 保存
7. Deployments → 最新部署 → Redeploy

### 方式 2：通过 CLI

```bash
# 添加环境变量
vercel env add VITE_API_URL
# 输入值: https://your-railway-app.up.railway.app

# 重新部署
vercel --prod
```

## 第三步：测试

```bash
# 测试后端
curl https://your-railway-app.up.railway.app/api/health

# 应该返回: {"status":"ok"}
```

访问前端：
```
https://auto-papers-tools.vercel.app
```

尝试注册用户，如果成功就完成了！🎉

## 常用命令

```bash
# 查看 Railway 日志
railway logs

# 查看 Railway 状态
railway status

# 查看环境变量
railway variables

# 重新部署
railway up --force

# 查看域名
railway domain
```

## 需要帮助？

查看完整文档：[DEPLOYMENT_COMPLETE.md](./DEPLOYMENT_COMPLETE.md)
