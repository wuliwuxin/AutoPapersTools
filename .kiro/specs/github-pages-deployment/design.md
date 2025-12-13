# Design Document

## Overview

本设计文档描述如何将时间序列分析论文助手应用正确部署到 GitHub Pages。由于 GitHub Pages 只支持静态网站托管，我们需要：

1. 配置 Vite 构建系统使用正确的 base 路径
2. 创建 GitHub Actions 工作流自动化部署流程
3. 处理单页应用（SPA）的客户端路由问题
4. 确保所有静态资源使用正确的路径

当前应用使用 Wouter 进行客户端路由，这是一个轻量级的路由库。我们需要确保在 GitHub Pages 环境下路由能够正常工作。

## Architecture

### 部署架构

```
GitHub Repository (main branch)
    ↓
GitHub Actions Workflow (触发构建)
    ↓
Vite Build (生成静态文件到 dist/public)
    ↓
Deploy to gh-pages branch
    ↓
GitHub Pages (托管静态网站)
```

### 路径处理策略

由于应用部署在 `https://wuliwuxin.github.io/AutoPapersTools/`，所有资源路径需要包含 `/AutoPapersTools/` 前缀：

- HTML: `/AutoPapersTools/index.html`
- JS: `/AutoPapersTools/assets/index-[hash].js`
- CSS: `/AutoPapersTools/assets/index-[hash].css`
- API: 由于是静态部署，后端 API 不可用

### 客户端路由处理

GitHub Pages 默认情况下，访问 `/AutoPapersTools/papers` 会尝试查找 `papers/index.html` 文件，如果不存在则返回 404。对于 SPA，我们有两种解决方案：

**方案 1: 使用 Hash 路由**
- 将路由模式改为 hash 模式（如 `/#/papers`）
- 优点：简单可靠，无需额外配置
- 缺点：URL 不够美观

**方案 2: 使用 404.html 重定向**
- 创建 404.html 文件，将所有请求重定向到 index.html
- 优点：URL 美观
- 缺点：需要额外的重定向逻辑

本设计采用**方案 1（Hash 路由）**，因为它更简单可靠。

## Components and Interfaces

### 1. Vite 配置更新

**文件**: `vite.config.ts`

需要修改的配置：
- `base`: 设置为 `/AutoPapersTools/`（仓库名）
- 确保构建输出到 `dist/public`

### 2. GitHub Actions 工作流

**文件**: `.github/workflows/deploy.yml`

工作流步骤：
1. Checkout 代码
2. 设置 Node.js 环境
3. 安装 pnpm
4. 安装依赖
5. 构建静态文件（设置 GITHUB_PAGES=true）
6. 部署到 gh-pages 分支

### 3. Wouter 路由配置

**文件**: `client/src/main.tsx` 或 `client/src/App.tsx`

需要配置 Wouter 使用 hash 路由：
```typescript
import { Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

// 在 App 组件中使用
<Router hook={useHashLocation}>
  {/* 路由配置 */}
</Router>
```

### 4. 环境变量处理

由于 GitHub Pages 是静态托管，后端 API 不可用。需要：
- 在构建时检测 GitHub Pages 环境
- 禁用或模拟后端相关功能
- 显示适当的提示信息

## Data Models

无需新的数据模型。

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Base path consistency

*For any* 构建配置，当 GITHUB_PAGES 环境变量为 true 时，Vite 的 base 配置应该设置为 `/AutoPapersTools/`

**Reasoning:** 这个属性确保构建系统在 GitHub Pages 环境下使用正确的基础路径。我们可以通过读取 Vite 配置并在不同环境变量设置下验证 base 值来测试这一点。

**Validates: Requirements 1.2**

### Property 2: Asset path correctness

*For any* 构建后的 HTML 文件中的静态资源引用（script、link、img 标签），其路径应该以 `/AutoPapersTools/` 开头

**Reasoning:** 这个属性确保所有静态资源使用正确的路径前缀，使得它们能在 GitHub Pages 上正确加载。我们可以解析构建后的 HTML，提取所有资源路径，并验证它们都包含正确的前缀。

**Validates: Requirements 1.4**

### Property 3: Hash route handling

*For any* 应用中定义的路由路径，使用 hash 路由格式（如 `#/papers`）访问时应该能够正确匹配和加载对应的组件

**Reasoning:** 这个属性确保客户端路由在 GitHub Pages 环境下正常工作。由于 GitHub Pages 不支持服务器端路由重写，我们使用 hash 路由来避免 404 错误。我们可以测试所有定义的路由路径是否能通过 hash 格式正确访问。

**Validates: Requirements 3.2, 4.2**

## Error Handling

### 构建错误

- 如果依赖安装失败，GitHub Actions 应该失败并显示错误信息
- 如果 Vite 构建失败，应该显示具体的构建错误
- 如果部署失败，应该显示部署错误信息

### 运行时错误

- 如果用户尝试访问需要后端的功能，应该显示友好的提示信息
- 如果路由不存在，应该显示 404 页面
- 如果资源加载失败，应该有适当的错误处理

### 回退机制

- 如果 GitHub Actions 部署失败，保持之前的版本不变
- 提供手动部署的备选方案

## Testing Strategy

### Unit Tests

由于这是配置和部署相关的改动，主要通过以下方式验证：

1. **本地构建测试**
   - 设置 `GITHUB_PAGES=true` 环境变量
   - 运行 `pnpm run build:static`
   - 检查生成的 `dist/public/index.html` 中的资源路径
   - 使用本地服务器（如 `python -m http.server`）在 `/AutoPapersTools/` 路径下测试

2. **路由功能测试**
   - 测试所有路由是否能正确加载
   - 测试页面刷新是否正常工作
   - 测试浏览器前进/后退按钮

3. **GitHub Actions 测试**
   - 推送测试提交触发工作流
   - 检查工作流日志确认每个步骤成功
   - 验证 gh-pages 分支内容正确

### Property-Based Tests

本项目使用 **Vitest** 作为测试框架。

配置要求：
- 每个属性测试至少运行 100 次迭代
- 使用 `fc` (fast-check) 库进行属性测试

属性测试任务：

1. **测试 Vite 配置的 base 路径**
   - 验证在不同环境变量下 base 路径的正确性

2. **测试构建输出的资源路径**
   - 解析构建后的 HTML
   - 验证所有资源路径包含正确的前缀

### Integration Tests

1. **端到端部署测试**
   - 完整执行一次部署流程
   - 访问实际的 GitHub Pages URL
   - 验证应用能够正常加载和运行

2. **路由集成测试**
   - 测试从首页导航到各个子页面
   - 测试直接访问子页面 URL
   - 测试页面刷新后的状态保持

## Implementation Notes

### 关键配置文件

1. **vite.config.ts**
   ```typescript
   base: process.env.GITHUB_PAGES === "true" ? "/AutoPapersTools/" : "/"
   ```

2. **.github/workflows/deploy.yml**
   - 使用 `actions/checkout@v4`
   - 使用 `actions/setup-node@v4`
   - 使用 `pnpm/action-setup@v4`
   - 使用 `peaceiris/actions-gh-pages@v4` 进行部署

3. **package.json**
   - 添加 `build:gh-pages` 脚本：`GITHUB_PAGES=true vite build`

### Wouter Hash 路由配置

需要修改 `client/src/App.tsx`：

```typescript
import { Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

function App() {
  return (
    <Router hook={useHashLocation}>
      {/* 现有路由配置 */}
    </Router>
  );
}
```

### 静态部署限制

由于 GitHub Pages 只支持静态文件，以下功能将不可用：
- 用户注册/登录（需要后端 API）
- 从 arXiv 获取论文（需要后端 API）
- 保存论文到数据库（需要后端 API）

可用功能：
- 上传本地 PDF（使用浏览器本地存储）
- AI 分析（如果用户提供 API 密钥，可以直接从前端调用）
- 浏览和搜索（使用本地数据）

### 文档更新

需要更新 README.md，添加：
- GitHub Pages 部署说明
- 功能限制说明
- 本地开发和生产部署的区别

## Security Considerations

1. **API 密钥安全**
   - 不要在前端代码中硬编码 API 密钥
   - 使用浏览器本地存储保存用户提供的 API 密钥
   - 提醒用户不要在公共设备上保存密钥

2. **CORS 问题**
   - 如果前端直接调用第三方 API，需要处理 CORS
   - 考虑使用 CORS 代理服务

3. **内容安全策略**
   - 确保加载的资源来自可信来源
   - 避免 XSS 攻击

## Performance Considerations

1. **构建优化**
   - 启用代码分割
   - 压缩静态资源
   - 使用 CDN 加速（GitHub Pages 自带 CDN）

2. **加载性能**
   - 懒加载路由组件
   - 优化图片和字体加载
   - 使用浏览器缓存

## Future Enhancements

1. **完整功能部署**
   - 考虑使用 Vercel、Netlify 等支持全栈应用的平台
   - 或者使用 Cloudflare Pages + Workers

2. **PWA 支持**
   - 添加 Service Worker
   - 支持离线访问

3. **自定义域名**
   - 配置自定义域名
   - 启用 HTTPS
