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

### 方案 1：GitHub Pages（免费，功能受限）

适合演示和个人使用，只支持前端功能。

```bash
git push origin main
# GitHub Actions 会自动部署到 GitHub Pages
```

访问：`https://你的用户名.github.io/ts_analysis_hub/`

**可用功能：**
- ✅ 上传本地论文
- ✅ AI 分析（需用户自己的 API 密钥）

**不可用功能：**
- ❌ 用户注册/登录
- ❌ 从 arXiv 获取论文
- ❌ 保存历史记录

### 方案 2：Vercel + PlanetScale（免费，完整功能）

推荐方案，支持所有功能。

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel

# 配置环境变量（在 Vercel Dashboard）
# - DATABASE_URL
# - JWT_SECRET
# - ENCRYPTION_KEY
```

详细部署指南请查看 [GitHub部署方案.md](./GitHub部署方案.md)

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

---

**开发者：** 吴鑫武  
**邮箱：** wu1351658806@163.com  
**项目地址：** https://github.com/你的用户名/ts_analysis_hub
