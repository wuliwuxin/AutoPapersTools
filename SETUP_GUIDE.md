# 时间序列分析平台 - 设置指南

## 🎉 实施完成

所有核心功能已成功实现！系统现在支持：

### ✅ 已实现的功能

1. **用户认证系统**
   - 用户注册和登录（`/register`, `/login`）
   - JWT 令牌认证
   - 受保护的路由
   - 自动令牌刷新

2. **多模型 API 密钥管理**
   - 支持 DeepSeek、OpenAI、Claude、Gemini
   - 加密存储 API 密钥（AES-256-GCM）
   - 设置默认模型
   - API 密钥管理界面（`/settings/api-keys`）

3. **智能分析系统**
   - 使用用户自己的 API 密钥进行分析
   - 实时进度跟踪（轮询机制）
   - 完成通知（Toast 提示）
   - Token 使用量和成本统计
   - 支持多个 LLM 提供商

4. **安全性**
   - AES-256-GCM 加密（API 密钥）
   - bcrypt 密码哈希（12 轮）
   - JWT 令牌保护（7天有效期）
   - 受保护的 API 端点

5. **arXiv 论文获取**
   - 关键词搜索
   - 日期范围过滤
   - 自动存储到数据库或内存

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

编辑 `.env` 文件：

```env
# DeepSeek API（可选，用于默认分析）
DEEPSEEK_API_KEY=sk-67642773789d481da0dec792f1e913a2

# 加密密钥（必需）
ENCRYPTION_KEY=your-32-byte-hex-encryption-key

# JWT 密钥（必需）
JWT_SECRET=your-jwt-secret-key

# 数据库（可选，不配置则使用内存存储）
# DATABASE_URL=mysql://user:password@localhost:3306/database

# Cookie 密钥
COOKIE_SECRET=your-cookie-secret
```

### 3. 启动开发服务器

```bash
pnpm dev
```

服务器将在 `http://localhost:3000` 启动。

## 📖 使用指南

### 步骤 1: 注册账户

1. 访问 `http://localhost:3000/register`
2. 填写邮箱、密码（至少8个字符）
3. 可选填写姓名
4. 点击"Register"创建账户

### 步骤 2: 配置 API 密钥

1. 登录后，访问 `http://localhost:3000/settings/api-keys`
2. 点击"Add API Key"
3. 选择提供商：
   - **DeepSeek**: 经济实惠，适合中文
   - **OpenAI**: GPT-4, GPT-3.5
   - **Claude**: Anthropic Claude 3
   - **Gemini**: Google Gemini Pro
4. 选择模型
5. 输入您的 API 密钥
6. 可选设置为默认模型
7. 点击"Add Key"

### 步骤 3: 获取论文

1. 访问 `http://localhost:3000/fetch-papers`
2. 输入搜索关键词（如"time series"）
3. 可选设置日期范围
4. 设置最大结果数
5. 点击"Fetch Papers"

### 步骤 4: 分析论文

1. 在论文列表中选择一篇论文
2. 点击论文标题查看详情
3. 点击"Start Analysis"按钮
4. 选择要使用的模型（或使用默认）
5. 系统会显示实时进度
6. 完成后会收到通知

### 步骤 5: 查看分析报告

分析完成后，报告会包含：
- **Summary**: 论文主要贡献概述
- **Key Findings**: 重要结果和发现
- **Methodology**: 研究方法和途径
- **Strengths**: 论文优势
- **Limitations**: 潜在局限性
- **Future Work**: 未来研究方向建议

## 🔧 技术架构

### 后端

- **框架**: Express + tRPC
- **认证**: JWT + bcrypt
- **加密**: AES-256-GCM
- **数据库**: MySQL（可选）或内存存储
- **LLM 适配器**: 支持多个提供商

### 前端

- **框架**: React + TypeScript
- **路由**: Wouter
- **UI**: TailwindCSS + shadcn/ui
- **状态管理**: tRPC + React Query
- **通知**: Sonner

### 文件结构

```
server/
├── _core/
│   ├── crypto.ts          # 加密服务
│   ├── jwt.ts             # JWT 服务
│   └── sdk.ts             # SDK（支持 JWT 和 OAuth）
├── llm/
│   └── adapters/          # LLM 适配器
│       ├── base.ts        # 基础接口
│       ├── deepseek.ts    # DeepSeek
│       ├── openai.ts      # OpenAI
│       ├── claude.ts      # Claude
│       ├── gemini.ts      # Gemini
│       └── index.ts       # 工厂
├── services/
│   └── analysisService.ts # 分析服务
├── routers/
│   ├── auth.ts            # 认证路由
│   ├── apiKeys.ts         # API 密钥路由
│   └── papers.ts          # 论文路由
└── db.ts                  # 数据库查询

client/
├── src/
│   ├── pages/
│   │   ├── Auth/          # 认证页面
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   └── Settings/      # 设置页面
│   │       └── ApiKeys.tsx
│   ├── components/
│   │   ├── ModelSelector.tsx      # 模型选择器
│   │   ├── ProgressTracker.tsx    # 进度跟踪
│   │   └── ProtectedRoute.tsx     # 受保护路由
│   └── contexts/
│       └── AuthContext.tsx        # 认证上下文
```

## 🔐 安全性说明

1. **API 密钥加密**: 所有 API 密钥使用 AES-256-GCM 加密存储
2. **密码哈希**: 使用 bcrypt（12 轮）哈希密码
3. **JWT 令牌**: 7天有效期，支持刷新
4. **受保护端点**: 需要认证的操作使用 `protectedProcedure`
5. **HTTPS**: 生产环境建议使用 HTTPS

## 💰 成本估算

系统会自动估算每次分析的成本：

- **DeepSeek**: ~$0.0002 per 1K tokens
- **OpenAI GPT-4**: ~$0.045 per 1K tokens
- **Claude**: ~$0.045 per 1K tokens
- **Gemini**: ~$0.000375 per 1K tokens

## 🐛 故障排除

### 问题: 无法连接数据库

**解决方案**: 系统会自动切换到内存存储模式。如果需要持久化，请配置 `DATABASE_URL`。

### 问题: API 密钥无效

**解决方案**: 
1. 检查 API 密钥是否正确
2. 确认提供商账户有足够余额
3. 验证 API 密钥权限

### 问题: 分析失败

**解决方案**:
1. 查看错误消息
2. 检查 API 密钥是否有效
3. 确认网络连接
4. 查看服务器日志

## 📚 API 文档

### 认证端点

- `POST /api/trpc/auth.register` - 注册用户
- `POST /api/trpc/auth.login` - 登录
- `GET /api/trpc/auth.me` - 获取当前用户
- `POST /api/trpc/auth.logout` - 登出
- `POST /api/trpc/auth.refresh` - 刷新令牌

### API 密钥端点

- `POST /api/trpc/apiKeys.add` - 添加 API 密钥
- `GET /api/trpc/apiKeys.list` - 获取密钥列表
- `PUT /api/trpc/apiKeys.update` - 更新密钥
- `DELETE /api/trpc/apiKeys.delete` - 删除密钥
- `GET /api/trpc/apiKeys.getDefault` - 获取默认密钥

### 论文端点

- `GET /api/trpc/papers.list` - 获取论文列表
- `GET /api/trpc/papers.detail` - 获取论文详情
- `POST /api/trpc/papers.fetchFromArxiv` - 从 arXiv 获取
- `POST /api/trpc/papers.startAnalysis` - 开始分析
- `GET /api/trpc/papers.getAnalysisStatus` - 获取分析状态

## 🎯 下一步

1. **测试系统**: 注册账户并测试所有功能
2. **添加 API 密钥**: 配置您喜欢的 LLM 提供商
3. **分析论文**: 开始使用系统分析论文
4. **反馈**: 如有问题或建议，请提出

## 📝 更新日志

### v2.0.0 (2024-12-13)

- ✅ 实现用户认证系统
- ✅ 实现多模型 API 密钥管理
- ✅ 实现智能分析系统
- ✅ 实现进度跟踪和通知
- ✅ 支持 DeepSeek、OpenAI、Claude、Gemini
- ✅ 加密存储和安全性增强

---

**祝您使用愉快！** 🚀
