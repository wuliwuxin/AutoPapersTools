# Vercel 部署指南（完整功能）

本指南说明如何将应用部署到 Vercel，获得完整的全栈功能。

## 为什么选择 Vercel？

- ✅ **完整功能**：支持前端 + 后端 API
- ✅ **免费套餐**：个人项目完全免费
- ✅ **自动部署**：Git 推送自动触发部署
- ✅ **全球 CDN**：快速访问
- ✅ **HTTPS**：自动配置 SSL 证书
- ✅ **环境变量**：安全管理敏感信息

## 快速开始

### 1. 准备工作

确保你已经：
- 有 GitHub 账号
- 项目已推送到 GitHub
- 安装了 Node.js 和 pnpm

### 2. 安装 Vercel CLI

```bash
npm install -g vercel
```

### 3. 登录 Vercel

```bash
vercel login
```

选择使用 GitHub 账号登录。

### 4. 部署项目

在项目根目录运行：

```bash
# 首次部署（预览环境）
vercel

# 按照提示操作：
# - Set up and deploy? Yes
# - Which scope? 选择你的账号
# - Link to existing project? No
# - What's your project's name? 输入项目名称
# - In which directory is your code located? ./
# - Want to override the settings? No
```

### 5. 生产部署

```bash
vercel --prod
```

部署完成后，你会获得一个 URL，如：
```
https://your-project-name.vercel.app
```

## 配置环境变量

### 方法 1：通过 Vercel Dashboard（推荐）

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下变量：

#### 必需的环境变量

```bash
# JWT 密钥（用于用户认证）
JWT_SECRET=your-random-secret-key-here

# 加密密钥（用于加密敏感数据）
ENCRYPTION_KEY=your-32-byte-encryption-key-here
```

#### 可选的环境变量

```bash
# 数据库连接（不配置则使用内存模式）
DATABASE_URL=mysql://user:password@host:3306/database

# DeepSeek API 密钥（系统默认）
DEEPSEEK_API_KEY=sk-your-api-key

# OpenAI API 密钥（系统默认）
OPENAI_API_KEY=sk-your-api-key

# Claude API 密钥（系统默认）
ANTHROPIC_API_KEY=sk-your-api-key

# Gemini API 密钥（系统默认）
GOOGLE_API_KEY=your-api-key
```

### 方法 2：通过 CLI

```bash
# 添加环境变量
vercel env add JWT_SECRET

# 查看环境变量
vercel env ls

# 拉取环境变量到本地
vercel env pull
```

### 生成密钥

使用以下命令生成安全的随机密钥：

```bash
# 生成 JWT_SECRET（64 字符）
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 生成 ENCRYPTION_KEY（Base64 编码的 32 字节）
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 配置数据库

### 选项 1：使用内存模式（默认）

不配置 `DATABASE_URL`，应用会使用内存存储：
- ✅ 无需配置
- ✅ 快速启动
- ❌ 数据不持久化（重启后丢失）

### 选项 2：使用 PlanetScale（推荐）

[PlanetScale](https://planetscale.com/) 提供免费的 MySQL 数据库：

1. **注册 PlanetScale**
   - 访问 https://planetscale.com/
   - 使用 GitHub 账号注册

2. **创建数据库**
   - 点击 "Create database"
   - 选择免费套餐
   - 选择区域（推荐 AWS us-east-1）

3. **获取连接字符串**
   - 进入数据库 → Settings → Passwords
   - 创建新密码
   - 复制连接字符串

4. **添加到 Vercel**
   - 在 Vercel 环境变量中添加 `DATABASE_URL`
   - 粘贴 PlanetScale 的连接字符串

5. **运行数据库迁移**
   ```bash
   # 本地运行迁移
   DATABASE_URL="your-connection-string" pnpm run db:push
   ```

### 选项 3：使用其他数据库

支持任何 MySQL 兼容的数据库：
- AWS RDS
- Google Cloud SQL
- Azure Database
- Railway
- Supabase

## 自动部署

### 连接 GitHub 仓库

1. 在 Vercel Dashboard 中选择项目
2. 进入 **Settings** → **Git**
3. 连接 GitHub 仓库

配置完成后：
- 推送到 `main` 分支 → 自动部署到生产环境
- 推送到其他分支 → 自动创建预览部署
- Pull Request → 自动创建预览部署

### 部署钩子

```bash
# 触发重新部署
vercel --prod --force
```

## 自定义域名

### 添加自定义域名

1. 在 Vercel Dashboard 中选择项目
2. 进入 **Settings** → **Domains**
3. 添加你的域名（如 `example.com`）
4. 按照提示配置 DNS 记录

### DNS 配置

在你的域名提供商处添加：

```
类型    名称    值
CNAME   www     cname.vercel-dns.com
A       @       76.76.21.21
```

或者使用 Vercel Nameservers（推荐）：
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

## 监控和日志

### 查看部署日志

```bash
# 查看最新部署日志
vercel logs

# 实时查看日志
vercel logs --follow
```

### 在 Dashboard 中查看

1. 访问 Vercel Dashboard
2. 选择项目
3. 查看 **Deployments** 标签
4. 点击具体部署查看详细日志

## 性能优化

### 1. 启用边缘缓存

Vercel 自动为静态资源启用 CDN 缓存。

### 2. 配置 Serverless Functions

在 `vercel.json` 中配置：

```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### 3. 环境变量优化

- 生产环境使用 `Production` 环境变量
- 开发环境使用 `Development` 环境变量
- 预览环境使用 `Preview` 环境变量

## 故障排除

### 问题：构建失败

**检查：**
1. 查看构建日志
2. 确认 `package.json` 中的脚本正确
3. 确认依赖安装成功

**解决：**
```bash
# 本地测试构建
pnpm run build

# 检查构建输出
ls -la dist/
```

### 问题：环境变量未生效

**检查：**
1. 确认环境变量已添加
2. 确认选择了正确的环境（Production/Preview/Development）
3. 重新部署项目

**解决：**
```bash
# 重新部署
vercel --prod --force
```

### 问题：数据库连接失败

**检查：**
1. 确认 `DATABASE_URL` 格式正确
2. 确认数据库允许 Vercel IP 访问
3. 确认数据库凭据正确

**解决：**
- PlanetScale 自动允许所有 IP
- 其他数据库需要在防火墙中添加 Vercel IP 范围

### 问题：API 路由 404

**检查：**
1. 确认 API 路由文件位置正确
2. 确认 `vercel.json` 配置正确

**解决：**
检查 `vercel.json` 中的 rewrites 配置。

## 成本估算

### 免费套餐限制

- ✅ 无限部署
- ✅ 100 GB 带宽/月
- ✅ 100 GB-小时 Serverless 执行时间
- ✅ 自动 HTTPS
- ✅ 自定义域名

对于个人项目和小型应用，免费套餐完全够用。

### 升级到 Pro

如果需要更多资源：
- $20/月
- 1 TB 带宽
- 1000 GB-小时执行时间
- 团队协作功能

## 与 GitHub Pages 对比

| 功能 | GitHub Pages | Vercel |
|------|-------------|--------|
| 静态网站 | ✅ | ✅ |
| 后端 API | ❌ | ✅ |
| 数据库 | ❌ | ✅ |
| 用户认证 | ❌ | ✅ |
| 自定义域名 | ✅ | ✅ |
| HTTPS | ✅ | ✅ |
| 构建时间 | 慢 | 快 |
| 全球 CDN | ✅ | ✅ |
| 环境变量 | ❌ | ✅ |

## 推荐工作流

### 开发流程

1. **本地开发**
   ```bash
   pnpm run dev
   ```

2. **推送到 GitHub**
   ```bash
   git push origin feature-branch
   ```

3. **自动创建预览部署**
   - Vercel 自动构建
   - 获得预览 URL
   - 在 PR 中查看

4. **合并到 main**
   ```bash
   git checkout main
   git merge feature-branch
   git push origin main
   ```

5. **自动部署到生产**
   - Vercel 自动部署
   - 更新生产环境

## 相关资源

- [Vercel 文档](https://vercel.com/docs)
- [Vercel CLI 文档](https://vercel.com/docs/cli)
- [PlanetScale 文档](https://planetscale.com/docs)
- [项目 GitHub 仓库](https://github.com/wuliwuxin/AutoPapersTools)

## 获取帮助

- [Vercel 社区](https://github.com/vercel/vercel/discussions)
- [Vercel Discord](https://vercel.com/discord)
- [项目 Issues](https://github.com/wuliwuxin/AutoPapersTools/issues)
