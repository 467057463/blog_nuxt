# Prisma 7.9.1 升级设计

## 任务目标

将项目中的 Prisma 核心依赖升级到 7.9.1，使现有 Nuxt 3 + MySQL 应用适配 Prisma 7 的 ESM 客户端、驱动适配器和配置方式，同时统一 CI/CD 与部署服务器使用 Node.js 22。

本次升级保持现有数据模型和业务查询行为不变，不创建业务数据库迁移，也不在生产工作流中新增自动迁移步骤。

## 当前状态

- `@prisma/client` 当前版本为 `^6.19.3`。
- 项目依赖 `@prisma/nuxt@^0.2.0`，但业务代码没有使用 `$prisma` 或 `usePrismaClient()`。
- 项目没有直接声明 Prisma CLI，当前 CLI 由 Nuxt 模块间接处理。
- Prisma Client 使用 `prisma-client-js` 并从 `@prisma/client` 导入。
- MySQL 连接 URL 位于 `prisma/schema.prisma`。
- 应用和 seed 均使用无构造参数的 `new PrismaClient()`。
- stage 工作流会执行 `prisma migrate deploy` 和 seed，production 工作流目前不执行数据库迁移。
- CI 的 `node-version` 引用了未在工作流内定义的 `env.NODE_VERSION`。

## 方案选择

采用“保留并升级 `@prisma/nuxt` 依赖，但暂时停用其 Nuxt 运行时集成”的方案。

原因如下：

1. `@prisma/nuxt@0.3.0` 仍依赖 Prisma 6 范围，并在内部使用无 adapter 的 `new PrismaClient()`。
2. Prisma 7 要求应用为 Prisma Client 提供数据库驱动 adapter。
3. 当前业务代码不依赖该模块提供的 composable、注入客户端或 DevTools 功能。
4. 暂停注册模块可以避免同时加载两套初始化方式，并保留未来模块兼容 Prisma 7 后重新启用的可能。

不采用给第三方模块打本地补丁的方案，因为补丁会扩大维护面，并在模块升级时产生额外兼容成本。

## 依赖设计

### 生产依赖

- `@prisma/client`: 固定为 `7.9.1`。
- `@prisma/adapter-mariadb`: 固定为 `7.9.1`，作为 MySQL/MariaDB 驱动适配器。
- `@prisma/nuxt`: 升级并固定为 `0.3.0`，但不在 `nuxt.config.ts` 中注册。
- `dotenv`: 用于 Prisma CLI 配置和独立 seed 脚本加载 `.env`。

### 开发依赖

- `prisma`: 固定为 `7.9.1`，确保 `generate`、`validate` 和 `migrate deploy` 使用项目锁定版本。

### Node.js 约束

- 新增 `.nvmrc`，内容为 `22.12.0`。
- 在 `package.json` 中设置 Node.js engine 为 `>=22.12.0 <23`。
- CI 和远程部署命令显式使用 Node.js `22.12.0`。

## Prisma 配置设计

### `prisma/schema.prisma`

- 将 generator provider 从 `prisma-client-js` 改为 `prisma-client`。
- 添加明确的客户端输出目录 `../generated/prisma`。
- 从 datasource 中移除 `url = env("DATABASE_URL")`。
- 数据模型、关系、枚举和字段保持不变，因此本次不新增 migration。

### `prisma.config.ts`

在项目根目录新增 Prisma CLI 配置：

- 显式加载 `dotenv/config`。
- 指定 schema 路径为 `prisma/schema.prisma`。
- 指定 migration 路径为 `prisma/migrations`。
- 指定 seed 命令为 `tsx prisma/seed.ts`。
- 从 `DATABASE_URL` 读取 CLI datasource URL。

原 `package.json` 中的 `prisma.seed` 配置迁移到该文件，避免同时维护两处配置。

## Prisma Client 初始化设计

### 共享客户端工厂

新增一个职责单一的共享工厂，用于：

1. 校验 `DATABASE_URL` 是否存在。
2. 使用 `@prisma/adapter-mariadb` 创建 adapter。
3. 从 `generated/prisma` 导入并创建 Prisma Client。
4. 对缺失或非法配置抛出带上下文的明确错误。

工厂不负责全局缓存，也不执行查询，使应用和 seed 可以复用相同的底层初始化规则。

### 应用单例

调整 `lib/prisma.ts`：

- 基于共享工厂创建客户端。
- 保留开发环境的 `globalThis` 单例，避免热更新重复创建连接池。
- 保留现有 Article `createdAt` 日期格式扩展。
- 为客户端初始化和全局缓存逻辑添加中文注释，说明这样设计是为了避免 Prisma 7 adapter 初始化分叉和开发环境连接泄漏。

### Seed 客户端

调整 `prisma/seed.ts`：

- 使用共享工厂创建独立客户端。
- 不复用应用开发环境的全局单例。
- seed 成功或失败后均断开数据库连接。
- 保持现有 seed 数据和执行语义不变。

## 类型与导入设计

以下文件中从 `@prisma/client` 导入的客户端和类型，统一改为从生成目录导入：

- `lib/prisma.ts`
- `prisma/seed.ts`
- `api/article.ts`
- `server/api/articles/[id]/darft.ts`
- 搜索过程中发现的其他直接 Prisma 导入位置

使用项目别名或稳定的相对路径，确保 Nuxt、Nitro、测试和 seed 均解析到同一份生成客户端。

## Nuxt 集成设计

调整 `nuxt.config.ts`：

- 从 `modules` 中移除 `@prisma/nuxt`。
- 删除旧版 `.prisma/client/index-browser` Vite alias。
- 添加中文注释，明确模块依赖暂时保留但不启用，是因为 `0.3.0` 的内部客户端初始化尚不支持 Prisma 7 强制 adapter。
- 继续依赖 Nitro 对 `lib` 的服务端自动导入，不把 Prisma Client 暴露到浏览器端。

## CI/CD 与部署设计

涉及：

- `.github/workflows/deploy.stage.yml`
- `.github/workflows/deploy.production.yml`

### 构建阶段

- `actions/setup-node` 明确指定 `22.12.0`。
- 使用 `npm ci` 代替 `npm install`，严格按照 `package-lock.json` 安装。
- 构建前显式执行 `npx prisma generate`。
- 确保部署产物包含运行迁移和 seed 所需的 Prisma schema、migration、配置及脚本。

### 远程激活阶段

- 加载 NVM 后执行 `nvm install 22.12.0` 和 `nvm use 22.12.0`。
- `npx prisma` 使用部署项目中锁定的 CLI 版本，不依赖临时下载。
- stage 保持现有 `migrate deploy` 和 seed 行为。
- production 不新增数据库迁移步骤，避免本次依赖升级改变现有生产发布策略。

修改工作流时保留用户当前未提交的 `.github/workflows/deploy.stage.yml` 改动，不覆盖或回退无关内容。

## 测试设计

项目当前没有测试框架。本次使用 Node.js 内置测试运行器配合 `tsx`，避免为升级契约引入大型测试依赖。

### 正常流程

- Prisma 配置可以加载，并指向正确的 schema、migration 和 seed。
- schema 使用 `prisma-client` provider 和明确 output。
- 生成后的 Prisma Client 可以从约定目录导入。
- 合法 `DATABASE_URL` 能创建带 MariaDB adapter 的客户端。
- 应用客户端继续包含 Article 日期格式扩展。

### 边界条件

- 开发环境重复加载应用客户端时复用全局单例。
- seed 创建独立客户端，不写入应用单例。
- 含端口和 URL 编码字符的 MySQL 连接串由 adapter 正确处理。

### 异常情况

- 缺少 `DATABASE_URL` 时抛出清晰错误。
- 非法连接配置不会被静默忽略。
- Prisma Client 尚未生成或导入路径错误时测试明确失败。

### TDD 流程

1. 先添加升级契约测试并在旧实现上运行，记录 Red 阶段失败。
2. 只实现使测试通过的最少升级代码。
3. 测试通过后重构共享客户端工厂和注释，避免重复初始化逻辑。
4. 每一步都不在测试失败时继续到下一阶段。

## ESLint 设计

当前项目没有可用的根级 ESLint 配置或 `lint` 脚本。为满足零错误、零警告验证要求，本次新增最小 Nuxt ESLint 配置和 lint 脚本。

检查范围聚焦于本次涉及的 TypeScript、Prisma 配置和 Nuxt 配置文件，避免在 Prisma 升级任务中顺带重写无关历史代码。所有新增或修改的函数、复杂逻辑都使用中文注释说明设计原因。

## 验证流程

实施完成后依次执行：

1. `npm ci`
2. 升级契约测试
3. `npx prisma validate`
4. `npx prisma generate`
5. Nuxt/TypeScript 类型检查
6. ESLint 检查，要求零错误零警告
7. `npm run build:stage`
8. `npm run build:production`
9. 检查锁文件中的 Prisma CLI、Client 和 adapter 均为 `7.9.1`
10. 搜索并确认业务代码不再从 `@prisma/client` 导入生成类型或客户端

需要真实数据库连接的测试与命令必须使用用户授权的测试或 stage 数据库，不针对生产数据库执行写操作。

## 涉及文件

预计新增或修改：

- `package.json`
- `package-lock.json`
- `.nvmrc`
- `prisma.config.ts`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- Prisma Client 共享工厂文件
- `lib/prisma.ts`
- `api/article.ts`
- `server/api/articles/[id]/darft.ts`
- `nuxt.config.ts`
- `.github/workflows/deploy.stage.yml`
- `.github/workflows/deploy.production.yml`
- 根级 ESLint 配置
- Prisma 升级契约测试

新增或修改的辅助文件固定为：

- `lib/create-prisma-client.ts`：共享 adapter 与客户端工厂。
- `tests/prisma-upgrade.test.ts`：升级契约测试。
- `eslint.config.mjs`：根级 ESLint 配置。

测试脚本使用 `tsx --test tests/**/*.test.ts`，类型检查使用 `npx nuxi typecheck`。

## 注意事项

- 本次不修改 Prisma 数据模型，不生成业务 migration。
- 不把生产数据库作为自动测试目标。
- 不覆盖工作区中现有的 workflow 改动和 `code-reviews/` 未跟踪目录。
- `@prisma/nuxt@0.3.0` 仅作为保留依赖，不注册运行时模块；重新启用前必须确认其支持 Prisma 7 adapter。
- Prisma 7 使用 ESM；项目已有 `"type": "module"`，需继续保持。
- MariaDB adapter 同时支持 MySQL，但连接池默认值可能与 Prisma 6 引擎不同；如部署后出现连接超时，再根据运行环境显式调整连接池参数，不在本次升级中预先加入未经验证的调优。
