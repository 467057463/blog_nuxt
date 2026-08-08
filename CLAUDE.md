# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

Nuxt 3 博客系统（SSR + Nitro/h3 后端）。前端 Nuxt/Vue/Element Plus/Pinia，后端为 `server/api` 文件系统路由，数据层 Prisma 7 + MariaDB，文件存储使用阿里云 OSS。Node 版本要求 **22.12（`>=22.12.0 <23`，见 `.nvmrc`/`engines`）**。

所有代码注释与文档使用**中文**。仓库部署走 GitHub Actions 双环境（stage/production），**服务器 VPN 差、无法 `npm install`，依赖必须随产物离线下发**——这是全局硬约束。

## 常用命令

```bash
npm run dev              # 开发服务器 http://localhost:3000
npm run build:stage      # 构建（production 同构，差异只在 CI 注入的 .env）
npm run lint             # ESLint（注意：范围有限，见下方"ESLint 范围"）
npm run typecheck        # nuxi typecheck
npm run test:prisma      # prisma 相关测试（tests/prisma-upgrade、deploy-workflows）
npx tsx --test tests/<file>.test.ts   # 运行单个测试（node:test + tsx，测试均在 tests/）
npx prisma generate      # 生成客户端到 generated/prisma
npx prisma migrate deploy
npx tsx prisma/seed.ts   # 数据种子（幂等：category/tag 用 skipDuplicates）
npm run sass             # sass 监听编译（辅助，非构建流程）
```

测试框架是 `node:test` + `tsx`，**不是 jest/vitest**。新增测试放 `tests/*.test.ts`，用 `import test from 'node:test'` + `node:assert/strict`。

## 架构

### 后端（Nitro/h3）
- **路由**：`server/api/**/*.ts` 文件系统路由。Nuxt/Nitro 自动导入 `defineEventHandler`、h3 工具（`getHeader`、`readMultipartFormData`、`setResponseStatus`、`getRouterParam`）、`useRuntimeConfig`、`responFormat` 等，无需显式 import。
- **统一响应**：`server/utils/responFormat.ts` 的 `responFormat(res=null, code=0, msg='请求成功')` 返回 `{ code, data: res, msg }`。业务错误码用 `1000xx` 段，定义在 `constant/ApiErrorMap`（login 用 100001/100002，electron_upload 用 100001-100005）。
- **工具函数**：`server/utils/*`，抽纯函数便于单测（如 `uploadValidate.ts`、`validateParams.ts`）。路由只做解析/鉴权/调用/聚合。
- **鉴权**：nuxt-auth-utils 会话 + JWT。`server/api/login.post.ts` 校验后 `setUserSession`。受保护路由用 `server/utils/auth.ts` 的 `auth(handler)` 包装器检查 `event.context.user`，未登录返回 401。
  - ⚠️ 注意：`auth.ts` 返回的失败对象用 `message` 字段，而 `responFormat` 用 `msg`——两者命名不一致，新代码优先统一走 `responFormat`。
- **请求校验**：zod schema 放 `api/` 目录，路由用 `readValidatedBody(event, schema.parse)`。`api/` 与 `constant/` 目录被 Nuxt/Nitro 自动导入，schema 与错误码常量可裸用（见 login.post.ts）。

### 数据层（Prisma 7 + MariaDB）
- **关键约束：Prisma 7 不再内置数据库驱动，必须用 adapter 初始化**。不能 `new PrismaClient()`。
- Schema：`prisma/schema.prisma`，client 输出到 `generated/prisma`。数据源在 `prisma.config.ts` 用 `env('DATABASE_URL')`（CLI 与 schema 解耦）。
- **连接工厂**：`lib/create-prisma-client.ts` 的 `createPrismaClient()`（校验 `mysql:` 协议，`new PrismaMariaDb(url)`）。**应用与 seed 都必须走这个工厂，保证 adapter 一致**。
- **应用客户端**：`lib/prisma.ts` 默认导出带 dayjs 日期格式扩展的单例，用 `globalThis` 缓存避免开发热更新重复建连接池。**seed 用 `createPrismaClient()`（不带扩展）**，避免脚本与业务返回值类型互相干扰。
- 数据模型：`Category`（自关联父子）、`Tag`、`User`、`Profile`、`Article`（含草稿关系 `darftId`/`darft`），枚举 `Role`、`ArticleStatus(DARFT/OFFICIAL)`。
- 迁移管理：`prisma/migrations`，seed 在 `prisma/seed.ts`（幂等）。

### OSS（ali-oss）
- `server/utils/oss.ts` 封装 OSS client，`oss.put`/`oss.upload`。key 前缀 `blog_data_{ossEnv}`（`runtimeConfig.ossEnv`）隔离 stage/production。
- `server/utils/uploadValidate.ts` 提供文件名校验 / key 拼接 / 鉴权比对的纯函数。

### 部署（GitHub Actions + pm2 + Node 22）
- 工作流：`.github/workflows/deploy.stage.yml` / `deploy.production.yml`，push 到 `stage`/`main` 分支触发。
- **离线部署（硬约束）**：CI 里 `npm ci` 后把 `node_modules` 连同 `.env lib generated .output prisma prisma.config.ts package*.json ecosystem*.config.cjs` 一起 tar 打包，scp 到服务器。**禁止在服务器上 `npm install`**。
- **pm2 + Node 22 `--env-file`**：`ecosystem.stage.config.cjs` 用 `node_args: '--env-file=${__dirname}/.env'` 加载运行时变量（相对路径不可靠，用绝对路径）；`cwd: __dirname` 固定工作目录。注意 pm2 的 `port` 字段只是元数据，真实监听端口须经 `env.PORT` 注入（stage=3001）。
- 激活流程：`ln -s` 指向 release → `prisma migrate deploy` → `tsx prisma/seed.ts` → `pm2 del/start`。
- 部署相关的既有测试：`tests/deploy-workflows.test.ts`、`tests/ecosystem-config.test.ts`、`tests/seed-idempotency.test.ts`。

## 重要约束与易错点

- **ESLint 范围有限**：`npm run lint` 只检查 `prisma.config.ts nuxt.config.ts lib prisma api/article.ts server/api/articles/[id]/darft.ts tests`——**`server/` 大部分文件不在 lint 范围**。改 `server/` 代码时 ESLint 不会自动把关，需手动对改动文件跑 `npx eslint --max-warnings=0 <files>`。
- ESLint 是 flat config（`eslint.config.mjs`）。`.cjs` 文件需用 `files:['**/*.cjs']` 的 globals 块声明 `module/require/__dirname` 等，否则 `no-undef` 误报。
- Prisma 7 强 adapter：新增任何初始化 PrismaClient 的地方都必须走 `createPrismaClient`。
- `responFormat` 的 `data` 字段承载业务数据；错误时传 `null`。保持 `{code, data, msg}` 三字段一致，勿混用 `message`。
- `lib/`、`constant/`、`api/` 目录被 Nitro 自动导入；`server/` 下文件不含自动导入，需显式 `import ... from '~/lib/prisma'` 等。
- 设计文档与实现计划存于 `docs/superpowers/specs/` 与 `docs/superpowers/plans/`，大功能变更前可参考既有流程。
