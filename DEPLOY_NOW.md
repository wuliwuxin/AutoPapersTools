# 🚀 立即部署到 Vercel

## ✅ 准备工作已完成

- Vercel CLI 已安装
- 配置文件已创建
- 环境变量已生成

## 📝 你的环境变量

**请保存以下值，稍后需要在 Vercel Dashboard 中添加：**

```
JWT_SECRET=8db1ea44c4904b772127d241a5d3dabea273c51b6605c9e39e515d1d344dbf6f
ENCRYPTION_KEY=kPaSUwAgZee2JcSTbLfyjqUTBu2GWrfVLis77ffNovQ=
```

## 🎯 部署步骤

### 1. 登录 Vercel

在终端运行：

```bash
vercel login
```

选择使用 **GitHub** 账号登录。

### 2. 部署项目

```bash
vercel
```

按照提示操作：

| 提示 | 回答 |
|------|------|
| Set up and deploy? | **Yes** |
| Which scope? | 选择你的账号 |
| Link to existing project? | **No** |
| What's your project's name? | **AutoPapersTools** |
| In which directory is your code located? | **.** (点号) |
| Want to override the settings? | **No** |

等待构建完成（约 2-3 分钟）。

### 3. 添加环境变量

部署完成后：

1. 访问 https://vercel.com/dashboard
2. 选择 **AutoPapersTools** 项目
3. 进入 **Settings** → **Environment Variables**
4. 点击 **Add New**
5. 添加以下变量：

#### 第一个变量
- Name: `JWT_SECRET`
- Value: `8db1ea44c4904b772127d241a5d3dabea273c51b6605c9e39e515d1d344dbf6f`
- Environment: 选择 **Production**, **Preview**, **Development**
- 点击 **Save**

#### 第二个变量
- Name: `ENCRYPTION_KEY`
- Value: `kPaSUwAgZee2JcSTbLfyjqUTBu2GWrfVLis77ffNovQ=`
- Environment: 选择 **Production**, **Preview**, **Development**
- 点击 **Save**

### 4. 重新部署

添加环境变量后，在终端运行：

```bash
vercel --prod
```

等待部署完成。

### 5. 访问你的应用

部署完成后，你会看到类似这样的 URL：

```
https://auto-papers-tools.vercel.app
```

或者

```
https://auto-papers-tools-[random].vercel.app
```

在浏览器中打开这个 URL，你的应用就可以使用了！

## 🎉 完成！

现在你可以：
- ✅ 注册新用户
- ✅ 登录系统
- ✅ 从 arXiv 获取论文
- ✅ 上传本地 PDF
- ✅ 进行 AI 分析
- ✅ 保存历史记录

## 📱 后续操作（可选）

### 配置自动部署

1. 在 Vercel Dashboard 中选择项目
2. 进入 **Settings** → **Git**
3. 连接你的 GitHub 仓库

配置完成后，每次推送到 `main` 分支都会自动部署。

### 配置数据库

如果需要持久化数据：

1. 注册 [PlanetScale](https://planetscale.com/)
2. 创建免费数据库
3. 获取连接字符串
4. 在 Vercel 中添加 `DATABASE_URL` 环境变量
5. 运行迁移：
   ```bash
   DATABASE_URL="your-connection-string" pnpm run db:push
   ```

### 配置自定义域名

1. 在 Vercel Dashboard 中选择项目
2. 进入 **Settings** → **Domains**
3. 添加你的域名
4. 按照提示配置 DNS

## 🆘 遇到问题？

- 查看 [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) 获取详细文档
- 查看 Vercel 部署日志：`vercel logs`
- 访问 [Vercel 文档](https://vercel.com/docs)

## 💡 提示

- 首次部署使用内存模式，数据不会持久化
- 可以稍后配置数据库实现数据持久化
- 环境变量修改后需要重新部署才能生效
- 使用 `vercel --prod` 部署到生产环境
- 使用 `vercel` 部署到预览环境

---

**准备好了吗？在终端运行 `vercel login` 开始部署！** 🚀
