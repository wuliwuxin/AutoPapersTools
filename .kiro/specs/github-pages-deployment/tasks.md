# Implementation Plan

- [x] 1. 更新 Vite 配置以支持 GitHub Pages 部署
  - 修改 `vite.config.ts`，根据 `GITHUB_PAGES` 环境变量设置正确的 base 路径
  - 确保 base 路径为 `/AutoPapersTools/`（与仓库名匹配）
  - 验证构建输出目录配置正确
  - _Requirements: 1.2, 1.3_

- [x] 1.1 编写属性测试验证 Vite base 路径配置
  - **Property 1: Base path consistency**
  - **Validates: Requirements 1.2**

- [x] 2. 配置 Wouter 使用 hash 路由
  - 在 `client/src/App.tsx` 中导入 `useHashLocation`
  - 将 `Router` 组件配置为使用 hash 路由模式
  - 确保所有现有路由定义保持不变
  - _Requirements: 3.2, 4.1, 4.2_

- [x] 2.1 编写属性测试验证 hash 路由处理
  - **Property 3: Hash route handling**
  - **Validates: Requirements 3.2, 4.2**

- [x] 3. 创建 GitHub Actions 部署工作流
  - 创建 `.github/workflows/deploy.yml` 文件
  - 配置工作流在推送到 main 分支时触发
  - 添加步骤：checkout 代码、设置 Node.js、安装 pnpm
  - 添加步骤：安装依赖、构建应用（设置 GITHUB_PAGES=true）
  - 添加步骤：部署到 gh-pages 分支
  - _Requirements: 2.1, 2.2_

- [x] 4. 添加构建脚本到 package.json
  - 添加 `build:gh-pages` 脚本，设置 GITHUB_PAGES 环境变量
  - 确保脚本使用 `vite build` 命令
  - _Requirements: 1.2_

- [x] 5. 测试本地构建
  - 运行 `GITHUB_PAGES=true pnpm run build:static` 进行本地构建
  - 检查 `dist/public/index.html` 文件中的资源路径
  - 使用本地服务器测试构建后的应用
  - 验证所有路由和资源加载正常
  - _Requirements: 1.3, 1.4_

- [x] 5.1 编写属性测试验证构建输出的资源路径
  - **Property 2: Asset path correctness**
  - **Validates: Requirements 1.4**

- [x] 6. 更新 README 文档
  - 添加 GitHub Pages 部署说明章节
  - 说明静态部署的功能限制（无后端 API）
  - 添加本地测试部署的步骤
  - 添加常见问题解答
  - _Requirements: 5.1_

- [x] 7. 处理静态部署的功能限制
  - 在需要后端 API 的功能处添加友好提示
  - 考虑禁用或隐藏不可用的功能（如用户登录、arXiv 获取）
  - 确保上传本地 PDF 功能可以正常工作
  - _Requirements: 1.1_

- [x] 8. 最终验证和部署
  - 推送代码到 GitHub 触发自动部署
  - 检查 GitHub Actions 工作流执行日志
  - 验证 gh-pages 分支内容正确
  - 访问 https://wuliwuxin.github.io/AutoPapersTools/ 确认应用正常显示
  - 测试所有路由和功能
  - _Requirements: 1.1, 2.3, 3.1_
