# 部署前检查清单

在部署到 Vercel 之前，请确认以下事项：

## ✅ 代码准备

- [ ] 所有更改已提交到 Git
- [ ] 代码已推送到 GitHub
- [ ] 本地构建成功：`pnpm run build`
- [ ] 本地测试通过：`pnpm test`

## ✅ 配置文件

- [ ] `vercel.json` 已创建
- [ ] `package.json` 包含正确的脚本
- [ ] 环境变量已准备好

## ✅ 环境变量准备

### 必需的环境变量

生成密钥：
```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

记录生成的值，稍后在 Vercel Dashboard 中添加。

### 可选的环境变量

- [ ] `DATABASE_URL` - 如果使用数据库
- [ ] `DEEPSEEK_API_KEY` - 如果提供系统默认 API
- [ ] `OPENAI_API_KEY` - 如果提供系统默认 API
- [ ] `ANTHROPIC_API_KEY` - 如果提供系统默认 API
- [ ] `GOOGLE_API_KEY` - 如果提供系统默认 API

## ✅ Vercel CLI

- [ ] 已安装 Vercel CLI：`npm install -g vercel`
- [ ] 已登录 Vercel：`vercel login`

## 🚀 准备部署

如果所有检查项都已完成，运行：

```bash
vercel
```

然后按照提示操作。

## 📝 部署后

- [ ] 在 Vercel Dashboard 添加环境变量
- [ ] 重新部署：`vercel --prod`
- [ ] 测试应用功能
- [ ] 配置自定义域名（可选）
- [ ] 连接 GitHub 仓库启用自动部署（可选）

## 🎉 完成！

你的应用现在应该已经在 Vercel 上运行了！
