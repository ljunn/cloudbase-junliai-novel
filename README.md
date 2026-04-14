# Junli AI Novel

面向作者和创作者的 AI 长篇小说工作台。

这不是运营后台，也不是单轮聊天产品。当前版本围绕一条主链路组织：

`作品 -> 故事设定 -> 角色 / 世界观 -> 粗纲 / 细纲 -> 分卷 -> 章节 -> AI 生成 -> 导出`

## 当前架构

- 前端：React + Vite + HashRouter
- 静态托管路径：`/novel`
- 后端：CloudRun Express API
- API 路径：`/novel/api/*`
- 登录：CloudBase `__auth` 统一登录页
- 数据库：CloudBase 关系型数据库
- AI：`@cloudbase/node-sdk` `app.ai()` 文本生成

## 公开入口约定

- 正式入口：`https://junliai.com/novel/`
- 正式页面路由：`https://junliai.com/novel/#/...`
- 正式 API：`https://junliai.com/novel/api/*`
- `https://junliai.com/novel/works` 这类无 `#` 深链不在支持范围内，返回 404 属于预期行为
- CloudRun 默认域名和 CloudBase 静态托管原始域名仅用于运维排查，不作为正式访问入口

## 视觉与交互约束

- 字体与视觉 token 复用 `cloudbase-junliai-blog`
- 控制台式左侧导航结构参考 `cloudbase-junliai-vip`
- 登录后第一屏直接进入工作台，不做营销首页
- 路由统一按 `/novel/#/...` 组织

## 当前环境

- CloudBase 环境 ID：`fanqie-xinshu-front-4cjw9c4ef031`
- 环境别名：`junli-ai`
- 区域：`ap-shanghai`
- CloudRun 服务：`junli-ai-novel-live`
- CloudRun 默认域名：`https://junli-ai-novel-live-230479-6-1257305037.sh.run.tcloudbase.com`
- 静态托管发布目录：`/novel`

## 目录结构

```text
.
├── database/
│   └── schema.sql
├── docs/
│   ├── data-model-generation-chain.md
│   └── page-structure.md
├── server/
│   ├── ai.mjs
│   ├── auth.mjs
│   ├── config.mjs
│   ├── exporter.mjs
│   ├── repository.mjs
│   └── server.mjs
├── src/
│   ├── auth/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── workspace/
│   ├── App.tsx
│   ├── index.css
│   └── types.ts
├── .github/workflows/deploy.yml
├── cloudbaserc.json
├── Dockerfile
└── scripts/prepare-cloudrun-context.sh
```

## 已实现能力

### 全局层

- 工作台
- 我的作品
- 新建作品
- 模板库
- AI 助手
- 回收站
- 个人中心

### 单本作品层

- 作品总览
- 故事设定
- 角色库
- 世界观
- 粗纲
- 细纲
- 分卷规划
- 章节列表
- 当前章节创作
- 时间线
- 伏笔 / 记忆库
- 提示词模板
- 导出

### 章节编辑器

- Markdown 正文编辑
- 自动保存
- 标题 / 摘要 / 状态编辑
- 字数统计
- 历史版本恢复
- AI 续写 / 改写 / 润色 / 扩写 / 压缩 / 改文风 / 生成对白 / 生成过渡段 / 生成章节标题 / 总结本章
- 上下文选择
- 将生成结果追加、插入到光标或替换选中文本
- 查看最近一次生成使用的上下文

## 数据库

已创建以下 SQL 表：

- `junli_novel_profiles`
- `junli_novel_projects`
- `junli_novel_documents`
- `junli_novel_volumes`
- `junli_novel_chapters`
- `junli_novel_chapter_versions`
- `junli_novel_ai_generations`
- `junli_novel_exports`

SQL 定义在 [database/schema.sql](/root/projects/cloudbase-junliai-novel/database/schema.sql)。

## 本地开发

安装依赖：

```bash
npm install
```

前端开发：

```bash
npm run dev
```

后端开发：

```bash
npm run dev:server
```

前后端联调：

```bash
npm run dev:full
```

生产构建：

```bash
npm run build
```

本地 API 启动：

```bash
npm run start
```

健康检查：

```bash
curl http://127.0.0.1:3000/novel/api/health
```

## 关键环境变量

### 前端

- `VITE_APP_BASE_PATH=/novel`
- `VITE_API_ORIGIN=<可选覆盖项，默认留空并走同源 /novel/api>`
- `VITE_LOGIN_ORIGIN=https://junliai.com`
- `VITE_ENV_ID=fanqie-xinshu-front-4cjw9c4ef031`
- `VITE_REGION=ap-shanghai`
- `VITE_PUBLISHABLE_KEY=<CloudBase Publishable Key>`

### CloudRun

- `ENV_ID=fanqie-xinshu-front-4cjw9c4ef031`
- `REGION=ap-shanghai`
- `APP_BASE_PATH=/novel`
- `FRONTEND_URL=https://junliai.com/novel/`
- `PUBLIC_BASE_URL=https://junliai.com/novel`
- `CORS_ALLOWED_ORIGINS=https://junliai.com,https://www.junliai.com,https://fanqie-xinshu-front-4cjw9c4ef031-1257305037.tcloudbaseapp.com,http://127.0.0.1:5173`
- `AI_PROVIDER=hunyuan-exp`
- `AI_MODEL=hunyuan-2.0-instruct-20251111`
- `CLOUDBASE_APIKEY=<CloudBase Server API Key>`

## GitHub Actions 部署

工作流文件：`.github/workflows/deploy.yml`

默认发布逻辑：

1. `npm ci`
2. `npm run build`
3. `bash scripts/prepare-cloudrun-context.sh`
4. `tcb login`
5. `tcb cloudrun deploy`
6. `tcb hosting deploy`

### 必填 GitHub Secrets

- `TCB_SECRET_ID`
- `TCB_SECRET_KEY`
- `TCB_ENV_ID`

兼容命名：

- `CLOUDBASE_API_KEY_ID`
- `CLOUDBASE_API_KEY`
- `CLOUDBASE_ENV_ID`

### 推荐 GitHub Variables

- `HOSTING_PATH=/novel`
- `NODE_VERSION=20`
- `FRONTEND_URL=https://junliai.com/novel/`
- `BACKEND_URL=https://junliai-llm-live-230479-6-1257305037.sh.run.tcloudbase.com`
- `VITE_API_ORIGIN` 仅在需要显式覆盖 API 基址时配置，默认留空
- `PUBLIC_BASE_URL=https://junliai.com/novel`

## 常见排查

- 如果浏览器里创建作品时报 `Failed to fetch`，优先检查当前前端来源是否被后端 CORS 放行。
- `https://www.junliai.com`、CloudBase 静态托管域名和常见本地开发地址默认已放行；如果你换了自定义域名，记得同步追加到 `CORS_ALLOWED_ORIGINS`。
- 如果你直接打开 `https://junliai.com/novel/works` 看到 404，不要按路径路由排查；当前项目是 `HashRouter`，正确地址是 `https://junliai.com/novel/#/works`。

## CloudBase 控制台入口

- [静态托管](https://tcb.cloud.tencent.com/dev?envId=fanqie-xinshu-front-4cjw9c4ef031#/static-hosting)
- [CloudRun](https://tcb.cloud.tencent.com/dev?envId=fanqie-xinshu-front-4cjw9c4ef031#/platform-run)
- [身份认证](https://tcb.cloud.tencent.com/dev?envId=fanqie-xinshu-front-4cjw9c4ef031#/identity/login-manage)
- [MySQL 数据库](https://tcb.cloud.tencent.com/dev?envId=fanqie-xinshu-front-4cjw9c4ef031#/db/mysql/table/default/)

## 文档索引

- [页面结构清单](/root/projects/cloudbase-junliai-novel/docs/页面结构清单.md)
- [数据模型与生成链路说明](/root/projects/cloudbase-junliai-novel/docs/数据模型与生成链路说明.md)
