# Prisma 7.9.1 升级实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Nuxt 3 + MySQL 项目升级到 Prisma 7.9.1，使用 MariaDB 驱动适配器和显式生成目录，并统一 Node.js 22.12.0、测试、Lint 和部署流程。

**Architecture:** Prisma CLI 配置迁移到根目录 `prisma.config.ts`，生成器改为 `prisma-client` 并输出到 `generated/prisma`。应用与 seed 通过 `lib/create-prisma-client.ts` 共用 adapter 初始化规则，`lib/prisma.ts` 只负责日期扩展和开发环境单例；`@prisma/nuxt@0.3.0` 保留为依赖但不注册运行时模块。

**Tech Stack:** Nuxt 3、TypeScript、Prisma ORM 7.9.1、`@prisma/adapter-mariadb` 7.9.1、MySQL、Node.js 22.12.0、Node Test Runner、tsx、ESLint 9。

## Global Constraints

- `@prisma/client`、`prisma`、`@prisma/adapter-mariadb` 必须固定为 `7.9.1`，不使用 `^` 或 `~`。
- `@prisma/nuxt` 固定为 `0.3.0`，保留依赖但不得出现在 Nuxt `modules` 中。
- Node.js 固定使用 `22.12.0`，`package.json` engine 为 `>=22.12.0 <23`。
- Prisma Client 固定输出到 `generated/prisma`，业务代码不得再从 `@prisma/client` 导入客户端或生成类型。
- 不修改 Prisma 数据模型，不创建业务 migration，不在 production 工作流新增自动迁移。
- stage 继续执行 `prisma migrate deploy` 和 seed。
- 必须遵循 Red → Green → Refactor；测试失败时不得进入下一任务。
- 所有新增或修改的函数、类和复杂逻辑必须添加中文注释，说明“为什么”。
- ESLint 最终必须零错误零警告。
- 不覆盖或提交现有工作区改动：`.github/workflows/deploy.stage.yml` 的任务前差异及未跟踪的 `code-reviews/`。
- 真实数据库写入只允许使用经用户授权的测试或 stage 数据库，禁止自动对生产数据库执行写操作。

---

## 文件结构与职责

### 新增文件

- `.nvmrc`：声明本地与服务器统一使用 Node.js 22.12.0。
- `prisma.config.ts`：唯一的 Prisma CLI schema、migration、seed 和 datasource 配置入口。
- `generated/prisma/**`：由 `prisma generate` 生成的 Prisma 7 客户端；不提交到 Git，由安装、测试和构建流程重新生成。
- `lib/create-prisma-client.ts`：校验连接串、创建 `PrismaMariaDb` adapter 和基础 Prisma Client。
- `tests/prisma-upgrade.test.ts`：Prisma schema、配置、依赖、工厂、单例和导入契约测试。
- `tests/deploy-workflows.test.ts`：Node 版本、确定性安装、生成、stage 数据库命令和 production 行为契约测试。
- `eslint.config.mjs`：仅为项目 TypeScript/配置文件提供可重复的 flat ESLint 配置。

### 修改文件

- `package.json`：固定 Prisma 依赖，新增 Node engine、test/typecheck/lint 脚本，迁移 seed 配置。
- `package-lock.json`：由 npm 根据固定版本重新生成。
- `.gitignore`：忽略 `generated/prisma/`；客户端始终由安装和构建流程重新生成。
- `prisma/schema.prisma`：切换 `prisma-client` provider、设置 output、移除 datasource URL。
- `prisma/seed.ts`：使用共享客户端工厂并保持独立连接生命周期。
- `lib/prisma.ts`：在基础客户端之上保留日期扩展和开发单例。
- `api/article.ts`：改用生成客户端类型，并以 `satisfies` 替代运行时 `Prisma.validator`。
- `server/api/articles/[id]/darft.ts`：改用生成客户端的 `Tag` 类型并移除可避免的 `any`/忽略注释。
- `nuxt.config.ts`：停用 `@prisma/nuxt`，删除旧 `.prisma/client` Vite alias。
- `.github/workflows/deploy.stage.yml`：Node 22.12.0、`npm ci`、显式 generate、完整部署产物和服务器 Node 切换。
- `.github/workflows/deploy.production.yml`：相同构建约束，但不新增 migration。

---

### Task 1: 建立升级契约测试并升级依赖与 Prisma 配置

**Files:**
- Create: `tests/prisma-upgrade.test.ts`
- Create: `.nvmrc`
- Create: `prisma.config.ts`
- Modify: `package.json:4-48`
- Modify: `package-lock.json`
- Modify: `.gitignore:8-12`
- Modify: `prisma/schema.prisma:3-10`

**Interfaces:**
- Consumes: 现有 `package.json`、`prisma/schema.prisma` 和 `DATABASE_URL` 环境变量名称。
- Produces: `prisma.config.ts` 默认导出、`generated/prisma` 输出契约、`npm run test:prisma`、`npm run prisma:generate`、Node 22.12.0 约束。

- [ ] **Step 1: 写入依赖、schema 和配置的失败测试**

创建 `tests/prisma-upgrade.test.ts`，先只使用 Node 内置模块读取文本和 JSON，确保测试在旧项目上可运行：

```ts
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readProjectFile = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Prisma 依赖固定为目标版本', async () => {
  const packageJson = JSON.parse(await readProjectFile('package.json'))

  assert.equal(packageJson.dependencies['@prisma/client'], '7.9.1')
  assert.equal(packageJson.dependencies['@prisma/adapter-mariadb'], '7.9.1')
  assert.equal(packageJson.dependencies['@prisma/nuxt'], '0.3.0')
  assert.equal(packageJson.devDependencies.prisma, '7.9.1')
})

test('Prisma 7 schema 使用显式输出且不保存 datasource URL', async () => {
  const schema = await readProjectFile('prisma/schema.prisma')

  assert.match(schema, /provider\s*=\s*"prisma-client"/)
  assert.match(schema, /output\s*=\s*"\.\.\/generated\/prisma"/)
  assert.doesNotMatch(schema, /url\s*=\s*env\("DATABASE_URL"\)/)
})

test('Node 运行时固定为 22.12.0', async () => {
  const packageJson = JSON.parse(await readProjectFile('package.json'))
  const nvmrc = (await readProjectFile('.nvmrc')).trim()

  assert.equal(packageJson.engines.node, '>=22.12.0 <23')
  assert.equal(nvmrc, '22.12.0')
})

test('Prisma CLI 配置包含 schema、migration、seed 和 datasource', async () => {
  const config = await readProjectFile('prisma.config.ts')

  assert.match(config, /schema:\s*['"]prisma\/schema\.prisma['"]/) 
  assert.match(config, /path:\s*['"]prisma\/migrations['"]/) 
  assert.match(config, /seed:\s*['"]tsx prisma\/seed\.ts['"]/) 
  assert.match(config, /url:\s*env\(['"]DATABASE_URL['"]\)/)
})
```

- [ ] **Step 2: 运行测试确认 Red**

Run: `npx tsx --test tests/prisma-upgrade.test.ts`

Expected: FAIL；至少报告 `@prisma/client` 仍为 `^6.19.3`、缺少 `.nvmrc` 或 schema provider 仍为 `prisma-client-js`。如果命令因文件缺失报错，也属于预期 Red。

- [ ] **Step 3: 修改 `package.json` 的版本、脚本和 Node engine**

目标内容：

```json
{
  "scripts": {
    "build:production": "nuxt build",
    "build:stage": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare && prisma generate",
    "prisma:generate": "prisma generate",
    "test:prisma": "tsx --test tests/prisma-upgrade.test.ts tests/deploy-workflows.test.ts",
    "typecheck": "nuxi typecheck",
    "lint": "eslint --max-warnings=0 prisma.config.ts nuxt.config.ts lib prisma api/article.ts server/api/articles/[id]/darft.ts tests",
    "sass": "sass --watch assets/styles:sass_test"
  },
  "engines": {
    "node": ">=22.12.0 <23"
  }
}
```

依赖目标：

```json
{
  "dependencies": {
    "@prisma/adapter-mariadb": "7.9.1",
    "@prisma/client": "7.9.1",
    "@prisma/nuxt": "0.3.0",
    "dotenv": "^17.2.2"
  },
  "devDependencies": {
    "@eslint/js": "9.39.2",
    "eslint": "9.39.2",
    "prisma": "7.9.1",
    "typescript-eslint": "8.66.0"
  }
}
```

删除旧的顶层 `"prisma": { "seed": ... }` 配置。保留其他现有依赖和脚本。

- [ ] **Step 4: 写入 Node、schema、CLI 配置和忽略规则**

`.nvmrc`：

```text
22.12.0
```

`prisma/schema.prisma` 头部：

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "mysql"
}
```

`prisma.config.ts`：

```ts
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// Prisma 7 将 CLI 数据源与生成器解耦，避免 schema 和部署脚本各自维护连接地址。
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

在 `.gitignore` 的依赖区加入：

```gitignore
# Prisma Client 由安装和构建流程生成，避免提交平台相关生成物。
generated/prisma
```

- [ ] **Step 5: 使用 Node 22.12.0 安装固定依赖并更新锁文件**

Run: `nvm use 22.12.0`（若未安装先运行 `nvm install 22.12.0`）

Run: `npm install`

Expected: `package-lock.json` 根依赖与安装节点反映 Prisma 7.9.1、adapter 7.9.1、Nuxt 模块 0.3.0；无 engine 错误。

- [ ] **Step 6: 验证配置测试转 Green，并生成客户端**

Run: `npx tsx --test tests/prisma-upgrade.test.ts`

Expected: Task 1 测试全部 PASS。完整 `npm run test:prisma` 在 Task 5 创建 `tests/deploy-workflows.test.ts` 后再执行。

Run: `npm run prisma:generate`

Expected: Prisma Client 生成到 `generated/prisma`，不写入 `node_modules/.prisma/client`。

Run: `npx prisma validate`

Expected: `The schema at prisma/schema.prisma is valid`。

- [ ] **Step 7: 提交配置升级**

```bash
git add .nvmrc .gitignore package.json package-lock.json prisma.config.ts prisma/schema.prisma tests/prisma-upgrade.test.ts
git commit -m "chore: upgrade Prisma dependencies to 7.9.1"
```

---

### Task 2: 通过 TDD 实现 Prisma Client 工厂

**Files:**
- Create: `lib/create-prisma-client.ts`
- Modify: `tests/prisma-upgrade.test.ts`

**Interfaces:**
- Consumes: `generated/prisma/client` 导出的 `PrismaClient`、`@prisma/adapter-mariadb` 导出的 `PrismaMariaDb`。
- Produces: `createPrismaClient(databaseUrl?: string): PrismaClient`；缺少或协议非法时抛出 `Error`。

- [ ] **Step 1: 为连接串校验和 adapter 初始化写失败测试**

在 `tests/prisma-upgrade.test.ts` 增加：

```ts
import { createPrismaClient } from '../lib/create-prisma-client'

test('合法 MySQL URL 可以创建 Prisma Client', async () => {
  const client = createPrismaClient('mysql://user:p%40ss@127.0.0.1:3307/blog')

  assert.equal(typeof client.$connect, 'function')
  assert.equal(typeof client.$disconnect, 'function')
  await client.$disconnect()
})

test('缺少 DATABASE_URL 时立即抛出明确错误', () => {
  assert.throws(
    () => createPrismaClient(''),
    /DATABASE_URL 未配置/,
  )
})

test('非 MySQL 协议不会被静默接受', () => {
  assert.throws(
    () => createPrismaClient('postgresql://user:pass@localhost/blog'),
    /DATABASE_URL 必须使用 mysql: 协议/,
  )
})
```

- [ ] **Step 2: 运行新增测试确认 Red**

Run: `npx tsx --test --test-name-pattern="Prisma Client|DATABASE_URL|MySQL" tests/prisma-upgrade.test.ts`

Expected: FAIL with `Cannot find module '../lib/create-prisma-client'`。

- [ ] **Step 3: 实现最小客户端工厂**

创建 `lib/create-prisma-client.ts`：

```ts
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client'

export function createPrismaClient(databaseUrl = process.env.DATABASE_URL): PrismaClient {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL 未配置，无法初始化 Prisma Client')
  }

  const parsedUrl = new URL(databaseUrl)
  if (parsedUrl.protocol !== 'mysql:') {
    throw new Error('DATABASE_URL 必须使用 mysql: 协议')
  }

  // Prisma 7 不再内置数据库驱动，因此应用与脚本必须共享同一种 adapter 初始化方式。
  const adapter = new PrismaMariaDb(databaseUrl)
  return new PrismaClient({ adapter })
}
```

- [ ] **Step 4: 运行测试确认 Green**

Run: `npx tsx --test --test-name-pattern="Prisma Client|DATABASE_URL|MySQL" tests/prisma-upgrade.test.ts`

Expected: 3 tests PASS，不建立真实数据库连接。

- [ ] **Step 5: 运行完整 Prisma 契约测试**

Run: `npx tsx --test tests/prisma-upgrade.test.ts`

Expected: PASS。

- [ ] **Step 6: 提交客户端工厂**

```bash
git add lib/create-prisma-client.ts tests/prisma-upgrade.test.ts
git commit -m "feat: add Prisma 7 client factory"
```

---

### Task 3: 通过 TDD 迁移应用单例和 seed 生命周期

**Files:**
- Modify: `lib/prisma.ts:1-28`
- Modify: `prisma/seed.ts:1-3,157-166`
- Modify: `tests/prisma-upgrade.test.ts`

**Interfaces:**
- Consumes: `createPrismaClient(databaseUrl?: string): PrismaClient`。
- Produces: `lib/prisma.ts` 默认导出的扩展客户端；`prisma/seed.ts` 使用独立基础客户端并始终断开连接。

- [ ] **Step 1: 写应用扩展和 seed 初始化契约的失败测试**

在测试文件增加静态契约，避免导入 `lib/prisma.ts` 时要求真实环境变量：

```ts
test('应用单例复用共享工厂并保留日期扩展', async () => {
  const source = await readProjectFile('lib/prisma.ts')

  assert.match(source, /createPrismaClient\(\)\.\$extends/)
  assert.match(source, /dayjs\(article\.createdAt\)\.format\('YYYY-MM-DD HH:mm'\)/)
  assert.match(source, /globalThis\.prismaGlobal/)
  assert.doesNotMatch(source, /from ['"]@prisma\/client['"]/)
})

test('seed 使用独立共享工厂并保证断开连接', async () => {
  const source = await readProjectFile('prisma/seed.ts')

  assert.match(source, /createPrismaClient\(\)/)
  assert.doesNotMatch(source, /new PrismaClient\(/)
  assert.match(source, /await prisma\.\$disconnect\(\)/)
})
```

- [ ] **Step 2: 运行测试确认 Red**

Run: `npx tsx --test --test-name-pattern="应用单例|seed" tests/prisma-upgrade.test.ts`

Expected: FAIL；旧文件仍直接从 `@prisma/client` 创建客户端。

- [ ] **Step 3: 最小改造 `lib/prisma.ts`**

目标实现：

```ts
import dayjs from 'dayjs'
import { createPrismaClient } from './create-prisma-client'

const prismaClientSingleton = () => {
  // 扩展只放在应用客户端上，seed 保持原始字段类型，避免脚本与业务返回值互相影响。
  return createPrismaClient().$extends({
    result: {
      article: {
        createdAt: {
          needs: { createdAt: true },
          compute(article) {
            return dayjs(article.createdAt).format('YYYY-MM-DD HH:mm')
          },
        },
      },
    },
  })
}

declare const globalThis: typeof global & {
  prismaGlobal?: ReturnType<typeof prismaClientSingleton>
}

// Nuxt 开发热更新会重复加载模块，全局缓存可避免创建多个数据库连接池。
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

export default prisma
```

- [ ] **Step 4: 最小改造 `prisma/seed.ts`**

文件头改为：

```ts
import 'dotenv/config'
import { createPrismaClient } from '../lib/create-prisma-client'

// Seed 必须拥有独立生命周期，避免部署脚本退出时遗留应用级连接池。
const prisma = createPrismaClient()
```

只替换 `prisma/seed.ts` 的导入与客户端创建（原第 1-3 行）；原 `main()` 函数中的 category、tag、user 和 article 数据（原第 4-155 行）逐字保持不变。文件结尾固定为：

```ts
main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('seeds run success!')
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
```

- [ ] **Step 5: 运行测试确认 Green**

Run: `npx tsx --test --test-name-pattern="应用单例|seed" tests/prisma-upgrade.test.ts`

Expected: PASS。

Run: `npm run typecheck`

Expected: `lib/prisma.ts` 和 `prisma/seed.ts` 无类型错误；如果其他旧代码仍因导入路径失败，进入 Task 4 统一修复，但不得忽略本任务文件自身错误。

- [ ] **Step 6: 提交应用和 seed 初始化**

```bash
git add lib/prisma.ts prisma/seed.ts tests/prisma-upgrade.test.ts
git commit -m "refactor: share Prisma adapter initialization"
```

---

### Task 4: 迁移生成类型导入并停用不兼容 Nuxt 模块

**Files:**
- Modify: `api/article.ts:1,96-186`
- Modify: `server/api/articles/[id]/darft.ts:1,13-21`
- Modify: `nuxt.config.ts:21-26,51-57`
- Modify: `tests/prisma-upgrade.test.ts`

**Interfaces:**
- Consumes: `generated/prisma/client` 导出的 `Prisma`、`Article`、`Category`、`Tag` 类型。
- Produces: 纯类型化的 `QueryArticleListItmeData`、`DarftData`，业务源代码中不再存在 `@prisma/client` 导入；Nuxt 不加载 `@prisma/nuxt`。

- [ ] **Step 1: 写导入和 Nuxt 模块契约失败测试**

```ts
test('业务代码只从生成客户端导入 Prisma 类型', async () => {
  const files = [
    'api/article.ts',
    'lib/prisma.ts',
    'prisma/seed.ts',
    'server/api/articles/[id]/darft.ts',
  ]

  for (const file of files) {
    const source = await readProjectFile(file)
    assert.doesNotMatch(source, /from ['"]@prisma\/client['"]/, file)
  }
})

test('Nuxt 暂停加载尚不兼容 Prisma 7 的模块', async () => {
  const source = await readProjectFile('nuxt.config.ts')

  assert.doesNotMatch(source, /['"]@prisma\/nuxt['"],?\s*$/m)
  assert.doesNotMatch(source, /\.prisma\/client\/index-browser/)
  assert.match(source, /Prisma 7.*adapter/)
})
```

- [ ] **Step 2: 运行测试确认 Red**

Run: `npx tsx --test --test-name-pattern="业务代码|Nuxt" tests/prisma-upgrade.test.ts`

Expected: FAIL；`api/article.ts` 和 endpoint 仍导入 `@prisma/client`，Nuxt 仍注册模块和 alias。

- [ ] **Step 3: 将 `api/article.ts` 改为纯类型导入与 `satisfies`**

文件头：

```ts
import type { Article, Category, Prisma, Tag } from '../generated/prisma/client'
import { z } from 'zod'
```

将两个 validator 表达式分别改为：

```ts
export const QueryArticleListItmeData = {
  omit: {
    authorId: true,
    updatedAt: true,
    categoryId: true,
  },
  include: {
    author: {
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      },
      include: {
        profile: {
          omit: {
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    },
    tags: true,
    category: true,
    parent: {
      select: {
        id: true,
      },
    },
  },
} satisfies Prisma.ArticleDefaultArgs
```

```ts
export const DarftData = {
  omit: {
    createdAt: true,
    updatedAt: true,
  },
  include: {
    tags: true,
    parent: {
      select: {
        id: true,
      },
    },
    darft: {
      omit: {
        createdAt: true,
        updatedAt: true,
      },
      include: {
        tags: true,
      },
    },
  },
} satisfies Prisma.ArticleDefaultArgs
```

最终文件头固定为：

```ts
import type { Category, Prisma, Tag } from '../generated/prisma/client'
import { z } from 'zod'
```

现有 `Article` 类型未在文件中使用，因此直接删除，不保留条件判断。

- [ ] **Step 4: 修正 endpoint 类型而不使用 `any` 或 `@ts-ignore`**

导入改为：

```ts
import type { Tag } from '../../../../generated/prisma/client'
```

在读取结果后使用以下明确的数据整形流程，保持原有草稿/正式文章分支：

```ts
const { id, parent, darft, darftId, status, ...article } = result!
const source = (darft ?? article) as typeof article & { tags: Tag[] }
const { tags, ...draftResult } = source

const response: DarftResultType = {
  ...draftResult,
  tagIds: tags.map(tag => tag.id),
  categoryId: draftResult.categoryId ?? 1,
  status,
  darftId: darftId ?? id ?? null,
  parentId: parent?.id ?? id ?? null,
}

if (status === 'OFFICIAL' && !darft) {
  response.darftId = null
}
if (status === 'DARFT' && !parent) {
  response.parentId = null
}

return responFormat(response)
```

删除原有 `res as any`、给 `id`/`tags` 赋 `undefined` 的代码和两处 `@ts-ignore`。

- [ ] **Step 5: 停用 `@prisma/nuxt` 运行时模块**

在 `nuxt.config.ts` 删除 Vite alias：

```ts
resolve: {
  alias: {},
},
```

删除整个 `vite.resolve` 块；当前配置除该旧 Prisma alias 外没有其他 alias。

从 `modules` 数组删除 `@prisma/nuxt`，并在数组上方添加：

```ts
// @prisma/nuxt 0.3.0 尚未支持 Prisma 7 强制 adapter，保留依赖但暂不加载运行时模块。
```

- [ ] **Step 6: 运行契约和类型检查确认 Green**

Run: `npx tsx --test --test-name-pattern="业务代码|Nuxt" tests/prisma-upgrade.test.ts`

Expected: PASS。

Run: `npm run typecheck`

Expected: PASS；重点确认 `Prisma.ArticleGetPayload` 可根据 `satisfies` 常量正确推导。

Run: `npm run build:stage`

Expected: Nuxt 构建成功，未出现 `.prisma/client/index-browser`、缺少 adapter 或浏览器打包数据库驱动错误。

- [ ] **Step 7: 提交导入和 Nuxt 集成迁移**

```bash
git add api/article.ts server/api/articles/[id]/darft.ts nuxt.config.ts tests/prisma-upgrade.test.ts
git commit -m "refactor: migrate app imports to generated Prisma client"
```

---

### Task 5: 通过契约测试升级 CI/CD 工作流

**Files:**
- Create: `tests/deploy-workflows.test.ts`
- Modify: `.github/workflows/deploy.stage.yml`
- Modify: `.github/workflows/deploy.production.yml`
- Modify: `package.json`（仅当 `test:prisma` 尚未包含该测试）

**Interfaces:**
- Consumes: `.nvmrc` 的 `22.12.0`、项目本地 Prisma CLI、根目录 `prisma.config.ts`。
- Produces: 可重复的 CI 安装/生成流程；stage 远程数据库步骤；production 不执行 migration。

- [ ] **Step 1: 在修改前保存现有 stage workflow 差异**

Run: `git diff -- .github/workflows/deploy.stage.yml`

Expected: 输出用户已有未提交改动。将输出保留在当前会话中，后续逐段编辑，不执行 `git checkout`、`git restore` 或覆盖写入整个文件。

- [ ] **Step 2: 写工作流失败测试**

创建 `tests/deploy-workflows.test.ts`：

```ts
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readWorkflow = (name: string) =>
  readFile(new URL(`../.github/workflows/${name}`, import.meta.url), 'utf8')

for (const name of ['deploy.stage.yml', 'deploy.production.yml']) {
  test(`${name} 使用 Node 22.12.0 和确定性安装`, async () => {
    const workflow = await readWorkflow(name)

    assert.match(workflow, /node-version:\s*22\.12\.0/)
    assert.match(workflow, /npm ci/)
    assert.doesNotMatch(workflow, /npm install(?:\s|$)/)
    assert.match(workflow, /npx prisma generate/)
    assert.match(workflow, /prisma\.config\.ts/)
  })
}

test('stage 部署使用固定 Node 并继续执行 migration 与 seed', async () => {
  const workflow = await readWorkflow('deploy.stage.yml')

  assert.match(workflow, /nvm install 22\.12\.0/)
  assert.match(workflow, /nvm use 22\.12\.0/)
  assert.match(workflow, /npx prisma migrate deploy/)
  assert.match(workflow, /npx tsx prisma\/seed\.ts/)
})

test('production 不新增自动 migration 或 seed', async () => {
  const workflow = await readWorkflow('deploy.production.yml')
  const activeScript = workflow.replace(/^\s*#.*$/gm, '')

  assert.doesNotMatch(activeScript, /prisma migrate deploy/)
  assert.doesNotMatch(activeScript, /prisma\/seed\.ts/)
})
```

- [ ] **Step 3: 运行工作流测试确认 Red**

Run: `npx tsx --test tests/deploy-workflows.test.ts`

Expected: FAIL；两个工作流仍引用未定义的 `env.NODE_VERSION` 并使用 `npm install`。

- [ ] **Step 4: 最小修改两个构建任务**

两个 workflow 的 setup-node 均改为：

```yaml
with:
  node-version: 22.12.0
  cache: npm
```

构建命令改为：

```yaml
- run: |
    npm ci
    npx prisma generate
    npm run build:stage
```

production 使用 `npm run build:production`。

部署压缩包必须包含根配置和数据库脚本：

```bash
tar -czf "${GITHUB_SHA}".tar.gz .output prisma prisma.config.ts package.json package-lock.json ecosystem.stage.config.cjs
```

production 使用对应 ecosystem 文件。不要把 `.env` 以外的新密钥写入产物。

- [ ] **Step 5: 最小修改 stage 远程激活脚本**

在 `source ~/.nvm/nvm.sh` 后加入：

```bash
nvm install 22.12.0
nvm use 22.12.0
```

保持 `ACTIVE_RELEASE_PATH` 现有语义。数据库命令从 release 根目录执行，确保能找到 `package.json` 和 `prisma.config.ts`：

```bash
cd $ACTIVE_RELEASE_PATH
npm ci --omit=dev=false
npx prisma migrate deploy
npx tsx prisma/seed.ts
pm2 del ./ecosystem.stage.config.cjs
pm2 start ./ecosystem.stage.config.cjs
```

如果部署架构要求仅运行 `.output/server` 依赖，则先验证其中是否包含本地 Prisma CLI；没有时必须使用上述 release 根目录安装方式，禁止让 `npx` 临时下载 CLI。

- [ ] **Step 6: 最小修改 production 远程 Node 版本**

同样加入：

```bash
nvm install 22.12.0
nvm use 22.12.0
```

保持 production 激活流程不执行 `prisma migrate deploy` 或 seed。

- [ ] **Step 7: 运行工作流契约测试确认 Green**

Run: `npx tsx --test tests/deploy-workflows.test.ts`

Expected: PASS。

Run: `git diff --check`

Expected: 无 YAML 尾随空格或冲突标记。

- [ ] **Step 8: 核对未覆盖用户已有 stage 改动**

Run: `git diff -- .github/workflows/deploy.stage.yml`

Expected: 用户原有改动仍存在，且新增改动只涉及 Node、安装、Prisma 生成、部署产物和激活命令。若无法可靠区分，停止并请求用户确认，不提交该文件。

- [ ] **Step 9: 提交可安全隔离的工作流改动**

`.github/workflows/deploy.stage.yml` 在任务开始前已有未提交改动，因此不得直接 `git add` 整个文件并把用户改动一并提交。默认行为：

```bash
git add .github/workflows/deploy.production.yml tests/deploy-workflows.test.ts package.json
git commit -m "ci: prepare production workflow for Prisma 7"
```

stage workflow 修改保留在工作区并在最终报告中单独列出。只有用户明确授权将既有差异一起提交时，才可执行：

```bash
git add .github/workflows/deploy.stage.yml
git commit -m "ci: prepare stage workflow for Prisma 7"
```

---

### Task 6: 建立 ESLint 并完成重构验证

**Files:**
- Create: `eslint.config.mjs`
- Modify: 本次涉及文件中被 ESLint 明确报告的问题
- Modify: `tests/prisma-upgrade.test.ts`（仅增加最终锁文件契约）

**Interfaces:**
- Consumes: `@eslint/js@9.39.2`、`typescript-eslint@8.66.0`、所有前序任务产物。
- Produces: `npm run lint` 零错误零警告，完整 Prisma 7 构建与测试证据。

- [ ] **Step 1: 写锁文件版本失败测试**

在 `tests/prisma-upgrade.test.ts` 增加：

```ts
test('锁文件解析到唯一的 Prisma 7.9.1 核心版本', async () => {
  const lock = JSON.parse(await readProjectFile('package-lock.json'))

  assert.equal(lock.packages['node_modules/@prisma/client'].version, '7.9.1')
  assert.equal(lock.packages['node_modules/@prisma/adapter-mariadb'].version, '7.9.1')
  assert.equal(lock.packages['node_modules/prisma'].version, '7.9.1')
})
```

- [ ] **Step 2: 运行锁文件测试**

Run: `npx tsx --test --test-name-pattern="锁文件" tests/prisma-upgrade.test.ts`

Expected: PASS。若 FAIL，先重新执行 Node 22.12.0 下的 `npm install` 并检查依赖树，不通过前不得继续。

- [ ] **Step 3: 创建最小 flat ESLint 配置**

`eslint.config.mjs`：

```js
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '.nuxt/**',
      '.output/**',
      'generated/**',
      'node_modules/**',
      'code-reviews/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      // TypeScript 已负责名称解析，关闭基础规则可避免把 Nuxt 自动导入误判为未定义。
      'no-undef': 'off',
    },
  },
)
```

- [ ] **Step 4: 首次运行 ESLint 并只修复实际报告**

Run: `npm run lint`

Expected: 初次可能 FAIL。逐项修复本次修改文件中的未使用变量、显式 `any`、无用 `@ts-ignore` 和格式问题；不得通过全局关闭规则隐藏可修复问题。对 Nuxt 自动导入只允许使用上述 `no-undef` 例外。

- [ ] **Step 5: 运行 ESLint 确认零错误零警告**

Run: `npm run lint`

Expected: exit code 0，0 errors，0 warnings。

- [ ] **Step 6: 执行完整测试与 Prisma 验证**

Run: `npm run test:prisma`

Expected: 全部 PASS。

Run: `npx prisma validate`

Expected: schema valid。

Run: `npm run prisma:generate`

Expected: 成功重新生成客户端。

Run: `npm run typecheck`

Expected: PASS。

- [ ] **Step 7: 执行两个生产模式构建**

Run: `npm run build:stage`

Expected: PASS，无 adapter、WASM、`.prisma/client` 或 ESM 错误。

Run: `npm run build:production`

Expected: PASS。

- [ ] **Step 8: 执行依赖和残留导入检查**

Run: `npm ls prisma @prisma/client @prisma/adapter-mariadb @prisma/nuxt`

Expected: 顶层分别显示 `prisma@7.9.1`、`@prisma/client@7.9.1`、`@prisma/adapter-mariadb@7.9.1`、`@prisma/nuxt@0.3.0`；允许 Nuxt 模块内部存在其声明的 Prisma 6 兼容依赖，但应用运行时不得引用它。

Run: `git grep -n "from ['\"]@prisma/client['\"]" -- '*.ts' '*.vue' ':!generated/**'`

Expected: 无输出。

Run: `git grep -n "@prisma/nuxt" -- nuxt.config.ts`

Expected: 只允许出现在解释停用原因的中文注释中，不得出现在 `modules` 数组。

- [ ] **Step 9: 提交质量配置和最终修复**

```bash
git add eslint.config.mjs package.json package-lock.json tests/prisma-upgrade.test.ts lib prisma api/article.ts server/api/articles/[id]/darft.ts nuxt.config.ts
git commit -m "test: verify Prisma 7 upgrade"
```

提交前运行 `git status --short`，不得加入 `code-reviews/` 或任务前已有的 stage workflow 用户改动。

---

### Task 7: 最终人工检查与结果报告

**Files:**
- Review only: 所有本次修改文件
- Do not modify unless a验证步骤失败并需要回到对应任务修复

**Interfaces:**
- Consumes: 所有前序提交和未提交的 stage workflow 升级差异。
- Produces: 可审计的测试、Lint、类型检查、构建结果，以及未提交用户改动说明。

- [ ] **Step 1: 检查工作区边界**

Run: `git status --short`

Expected: 不包含意外生成物；`code-reviews/` 保持未跟踪且未被加入提交；stage workflow 如因保护用户既有差异而未提交，需要明确显示为修改状态。

- [ ] **Step 2: 检查最终 diff**

Run: `git diff --check`

Expected: 无空白错误。

Run: `git log --oneline --grep="Prisma\|prisma" --reverse`

Expected: 列出本次 Prisma 升级相关提交。随后对输出中的最早提交父提交执行 `git diff --stat <首个升级提交>^..HEAD`，确认仅包含设计范围内文件。

- [ ] **Step 3: 汇总验证结果**

最终报告必须逐项给出真实命令和结果：

- Node.js 实际版本。
- Prisma 三个核心包及 Nuxt 模块解析版本。
- 契约测试通过数量。
- `prisma validate` 和 `prisma generate` 结果。
- Typecheck 结果。
- ESLint 的错误/警告数量。
- stage 和 production 构建结果。
- 是否执行数据库连接、migration 或 seed；未获得 stage 数据库授权时明确说明未执行真实写入。
- stage workflow 是否因既有用户改动而保留未提交。

- [ ] **Step 4: 请求代码审查**

调用 `superpowers:requesting-code-review`，审查重点：Prisma 7 adapter 生命周期、生成客户端是否泄漏到浏览器、部署产物能否使用本地 CLI、用户既有 workflow 改动是否被保留。

- [ ] **Step 5: 处理审查结论**

如有有效问题，调用 `superpowers:receiving-code-review`，回到对应任务执行 Red → Green 修复并重新运行完整验证；无有效问题时，使用 `superpowers:verification-before-completion` 完成最终证据核验。
