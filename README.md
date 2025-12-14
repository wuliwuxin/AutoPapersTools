# 时间序列分析论文助手

一个基于 AI 的学术论文分析平台，专注于时间序列分析领域的研究论文。

## ✨ 核心功能

- 📄 **论文管理**：从 arXiv 自动获取或上传本地 PDF 论文
- 🤖 **AI 深度分析**：使用多种 LLM（DeepSeek、OpenAI、Claude、Gemini）进行五维度分析
- 🔍 **智能搜索**：30+ 预设关键词，覆盖时间序列分析各个领域
- 👤 **用户系统**：注册、登录、API 密钥管理
- 💾 **数据持久化**：保存论文、分析报告和用户偏好

## 🚀 快速开始

### 环境要求

- Node.js 20+
- pnpm 10+
- MySQL 8.0+（或使用内存模式）

### 安装

```bash
# 克隆项目
git clone https://github.com/你的用户名/ts_analysis_hub.git
cd ts_analysis_hub

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库和 API 密钥

# 运行数据库迁移（如果使用 MySQL）
pnpm run db:push

# 启动开发服务器
pnpm run dev
```

访问 http://localhost:3000

## 📦 部署

### 🎯 推荐方案：Vercel (前端) + Railway (后端)

这是最佳部署方案，提供完整功能和最佳性能。

#### ⚡ 5 分钟快速部署

查看详细指南：**[QUICK_DEPLOY_RAILWAY.md](./QUICK_DEPLOY_RAILWAY.md)**

```bash
# 1. 部署后端到 Railway
npm install -g @railway/cli
railway login
railway init
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=8db1ea44c4904b772127d241a5d3dabea273c51b6605c9e39e515d1d344dbf6f
railway variables set ENCRYPTION_KEY=kPaSUwAgZee2JcSTbLfyjqUTBu2GWrfVLis77ffNovQ=
railway up
railway domain create

# 2. 在 Vercel 中添加环境变量
# VITE_API_URL = https://your-railway-app.up.railway.app

# 3. 重新部署 Vercel
vercel --prod
```

#### ✅ 功能对比

| 功能 | GitHub Pages | Vercel + Railway |
|------|-------------|------------------|
| 前端界面 | ✅ | ✅ |
| 用户注册/登录 | ❌ | ✅ |
| 从 arXiv 获取论文 | ❌ | ✅ |
| 数据持久化 | ❌ | ✅ |
| AI 分析 | ✅ | ✅ |
| 完整后端 API | ❌ | ✅ |

#### 📚 详细部署文档

- **[完整部署指南](./DEPLOYMENT_COMPLETE.md)** - 详细步骤和故障排除
- **[快速部署](./QUICK_DEPLOY_RAILWAY.md)** - 5 分钟快速上手
- **[Railway 部署](./RAILWAY_DEPLOYMENT.md)** - Railway 详细配置
- **[Vercel 部署](./VERCEL_DEPLOYMENT.md)** - Vercel 详细配置
- **[部署选项说明](./DEPLOYMENT_OPTIONS.md)** - 各种部署方案对比

### 方案 1：GitHub Pages（仅前端演示）

适合快速演示，但功能受限（无后端 API）。

#### 自动部署

1. 进入 GitHub 仓库 Settings → Pages
2. Source 选择 "GitHub Actions"
3. 推送代码到 main 分支自动部署

访问：`https://wuliwuxin.github.io/AutoPapersTools/`

**限制：** 无用户系统、无法从 arXiv 获取论文、无数据持久化

### 方案 2：仅 Vercel（不推荐）

Vercel Serverless Functions 对 Express + tRPC 应用支持有限：
- ❌ 10 秒超时限制
- ❌ 连接池问题
- ❌ 冷启动慢

**建议使用 Vercel + Railway 方案获得最佳体验。**

### 环境变量说明

```bash
# 生成 JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 生成 ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

部署完成后，你会获得一个 Vercel 域名：`https://your-project.vercel.app`

详细部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🛠️ 技术栈

### 前端
- React 19
- TypeScript
- Tailwind CSS
- Wouter（路由）
- tRPC（类型安全 API）
- Shadcn UI

### 后端
- Node.js + Express
- tRPC
- Drizzle ORM
- MySQL / SQLite
- JWT 认证

### AI 集成
- DeepSeek
- OpenAI
- Claude
- Gemini

## 📖 使用指南

### 1. 注册和登录

首次使用需要注册账号，然后登录系统。

### 2. 配置 API 密钥

访问个人中心，添加你的 LLM API 密钥：
- DeepSeek API Key
- OpenAI API Key
- Claude API Key
- Gemini API Key

至少配置一个 API 密钥才能使用分析功能。

### 3. 获取论文

**方式 1：从 arXiv 获取**
- 点击"获取论文"
- 选择预设关键词或输入自定义关键词
- 设置日期范围和结果数量
- 点击"开始获取"

**方式 2：上传本地 PDF**
- 点击"上传论文"
- 选择 PDF 文件
- 填写标题、摘要、引言（推荐）
- 点击"上传并分析"

### 4. 深度分析

- 在论文详情页点击"开始深度分析"
- 系统会使用你配置的默认 API 密钥
- 等待 30-60 秒
- 查看五维度分析报告：
  - Background（问题背景）
  - What（解决方案）
  - Why（价值与挑战）
  - How（实现方法）
  - How-why（方法论证）
  - Summary（核心要点）

## 🔑 环境变量

```bash
# 数据库
DATABASE_URL=mysql://user:password@localhost:3306/ts_analysis_hub

# JWT 密钥（随机生成）
JWT_SECRET=your-random-secret-key

# 加密密钥（随机生成，32字节）
ENCRYPTION_KEY=your-32-byte-encryption-key

# DeepSeek API（可选，用于系统默认）
DEEPSEEK_API_KEY=sk-your-api-key
```

## 📝 开发

```bash
# 开发模式
pnpm run dev

# 构建
pnpm run build

# 类型检查
pnpm run check

# 格式化代码
pnpm run format

# 运行测试
pnpm run test
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [arXiv](https://arxiv.org/) - 论文数据源
- [DeepSeek](https://www.deepseek.com/) - AI 分析引擎
- [Shadcn UI](https://ui.shadcn.com/) - UI 组件库

