# 快速部署到 Vercel

## 🚀 5 分钟部署指南

### 步骤 1：安装 Vercel CLI

```bash
npm install -g vercel
```

### 步骤 2：登录 Vercel

```bash
vercel login
```

选择使用 GitHub 账号登录。

### 步骤 3：部署项目

在项目根目录运行：

```bash
vercel
```

按照提示操作：
- **Set up and deploy?** → `Yes`
- **Which scope?** → 选择你的账号
- **Link to existing project?** → `No`
- **What's your project's name?** → `AutoPapersTools` (或其他名称)
- **In which directory is your code located?** → `./`
- **Want to override the settings?** → `No`

等待构建完成（约 2-3 分钟）。

### 步骤 4：配置环境变量

部署完成后，访问 [Vercel Dashboard](https://vercel.com/dashboard)：

1. 选择你的项目
2. 进入 **Settings** → **Environment Variables**
3. 添加以下必需的环境变量：

#### 生成密钥

```bash
# 生成 JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 生成 ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### 添加环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `JWT_SECRET` | (生成的 hex 字符串) | 用户认证密钥 |
| `ENCRYPTION_KEY` | (生成的 base64 字符串) | 数据加密密钥 |

可选环境变量：
- `DATABASE_URL` - MySQL 数据库连接（不配置则使用内存模式）
- `DEEPSEEK_API_KEY` - DeepSeek API 密钥（系统默认）

### 步骤 5：重新部署

添加环境变量后，重新部署以使其生效：

```bash
vercel --prod
```

## ✅ 完成！

部署完成后，你会获得一个 URL：
```
https://your-project-name.vercel.app
```

访问这个 URL，你的应用就可以使用了！

## 🎯 功能说明

在 Vercel 上，所有功能都可用：
- ✅ 用户注册/登录
- ✅ 从 arXiv 获取论文
- ✅ 上传本地 PDF
- ✅ AI 深度分析
- ✅ 保存历史记录
- ✅ 用户偏好设置

## 📝 后续操作

### 自动部署

连接 GitHub 仓库以启用自动部署：

1. 在 Vercel Dashboard 中选择项目
2. 进入 **Settings** → **Git**
3. 连接你的 GitHub 仓库

配置完成后，每次推送到 `main` 分支都会自动部署。

### 配置数据库（可选）

如果需要持久化数据，推荐使用 [PlanetScale](https://planetscale.com/)：

1. 注册 PlanetScale 账号
2. 创建免费数据库
3. 获取连接字符串
4. 在 Vercel 中添加 `DATABASE_URL` 环境变量
5. 运行数据库迁移：
   ```bash
   DATABASE_URL="your-connection-string" pnpm run db:push
   ```

## 🆘 遇到问题？

查看详细文档：
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - 完整部署指南
- [Vercel 文档](https://vercel.com/docs)

## 📊 监控部署

查看部署状态：
```bash
vercel logs
```

或访问 Vercel Dashboard 查看详细日志。
