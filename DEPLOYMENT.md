# GitHub Pages 部署指南

本文档说明如何将应用部署到 GitHub Pages。

## 前提条件

- GitHub 账号
- 项目已推送到 GitHub 仓库

## 部署步骤

### 1. 配置 GitHub Pages

1. 访问你的 GitHub 仓库
2. 进入 **Settings** → **Pages**
3. 在 **Source** 下拉菜单中选择 **GitHub Actions**

### 2. 推送代码触发部署

```bash
# 确保所有更改已提交
git add .
git commit -m "Configure GitHub Pages deployment"

# 推送到 main 分支
git push origin main
```

### 3. 查看部署状态

1. 进入仓库的 **Actions** 标签页
2. 查看 "Deploy to GitHub Pages" 工作流的运行状态
3. 等待构建和部署完成（通常需要 2-5 分钟）

### 4. 访问应用

部署完成后，访问：
```
https://wuliwuxin.github.io/AutoPapersTools/
```

## 本地测试

在推送到 GitHub 之前，建议先在本地测试构建：

```bash
# 使用 GitHub Pages 配置构建
pnpm run build:gh-pages

# 检查构建输出
ls -la dist/public

# 使用本地服务器测试
cd dist/public
python3 -m http.server 8000

# 在浏览器中访问
# http://localhost:8000/AutoPapersTools/
```

## 技术细节

### 路由配置

应用使用 **Hash 路由** 以支持 GitHub Pages 的静态托管：

- 路由格式：`https://wuliwuxin.github.io/AutoPapersTools/#/papers`
- Hash 符号 `#` 后的部分由客户端处理
- 避免了 GitHub Pages 的 404 问题

### 资源路径

所有静态资源使用 `/AutoPapersTools/` 作为基础路径：

- JavaScript: `/AutoPapersTools/assets/index-[hash].js`
- CSS: `/AutoPapersTools/assets/index-[hash].css`
- 其他资源: `/AutoPapersTools/assets/...`

### 环境变量

构建时设置 `GITHUB_PAGES=true` 环境变量：

```bash
GITHUB_PAGES=true pnpm run build:static
```

这会触发 Vite 使用正确的 base 路径配置。

## 功能限制

由于 GitHub Pages 只支持静态文件托管，以下功能不可用：

### ❌ 不可用功能

- **用户认证**：注册、登录、会话管理
- **数据库操作**：保存论文、分析报告、用户偏好
- **后端 API**：从 arXiv 获取论文、服务器端处理

### ✅ 可用功能

- **上传本地 PDF**：使用浏览器本地存储
- **AI 分析**：用户提供 API 密钥后可直接调用
- **浏览界面**：查看和搜索本地数据

## 故障排除

### 问题：页面显示 404

**原因**：GitHub Pages 配置不正确

**解决方案**：
1. 确认 Settings → Pages → Source 设置为 "GitHub Actions"
2. 检查 Actions 工作流是否成功运行
3. 等待几分钟让 GitHub Pages 更新

### 问题：资源加载失败

**原因**：资源路径不正确

**解决方案**：
1. 确认 `vite.config.ts` 中的 base 路径为 `/AutoPapersTools/`
2. 重新构建：`pnpm run build:gh-pages`
3. 检查 `dist/public/index.html` 中的资源路径

### 问题：路由不工作

**原因**：未使用 Hash 路由

**解决方案**：
1. 确认 `client/src/App.tsx` 中使用了 `useHashLocation`
2. URL 应该包含 `#` 符号，如 `/#/papers`

### 问题：GitHub Actions 构建失败

**原因**：依赖安装或构建错误

**解决方案**：
1. 查看 Actions 日志获取详细错误信息
2. 确认 `package.json` 中的依赖正确
3. 本地运行 `pnpm install` 和 `pnpm run build:gh-pages` 测试

## 更新部署

要更新已部署的应用：

```bash
# 1. 修改代码
# 2. 提交更改
git add .
git commit -m "Update application"

# 3. 推送到 main 分支
git push origin main

# GitHub Actions 会自动重新构建和部署
```

## 完整功能部署

如需使用完整功能（包括后端 API），建议部署到支持全栈应用的平台：

### 推荐平台

1. **Vercel**
   - 免费套餐支持全栈应用
   - 自动 CI/CD
   - 简单配置

2. **Netlify**
   - 免费套餐支持 Serverless Functions
   - 自动部署
   - 易于配置

3. **Railway**
   - 支持数据库
   - 容器化部署
   - 免费额度

### Vercel 部署示例

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

## 测试

运行测试以验证配置：

```bash
# 运行所有部署相关测试
pnpm test server/vite-config.test.ts
pnpm test server/build-output.test.ts
pnpm test client/src/hash-routing.test.ts
```

## 相关文件

- `.github/workflows/deploy.yml` - GitHub Actions 工作流配置
- `vite.config.ts` - Vite 构建配置
- `client/src/App.tsx` - 路由配置
- `package.json` - 构建脚本

## 参考资源

- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [Wouter Hash 路由](https://github.com/molefrog/wouter#hash-based-routing)
