# 修复 stage 部署产物缺失导致 seed/migrate 失败

## 任务目标

修复 GitHub Actions stage 部署在服务器 `activate-release` 阶段连续失败的问题。根因是 Prisma 7 升级后，部署 tar 产物缺少服务器端执行 `prisma migrate deploy` 与 `tsx prisma/seed.ts` 所必需的文件。

## 根因（已定位）

日志中 3 个错误中，本次修复 2 个（pm2 不在本次范围）：

1. **`PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL`**
   - 来源：`npx prisma migrate deploy`（`deploy.stage.yml` 激活脚本）。
   - 原因：`prisma.config.ts` 使用 `env('DATABASE_URL')`，但 CI 只把 `.env` 拷贝到 `.output/server/.env`，未把根 `.env` 打包进 tar。服务器 release 根目录没有 `.env`，shell 也未 export，导致 prisma CLI 读不到连接串。
2. **`ERR_MODULE_NOT_FOUND: lib/create-prisma-client`（来自 seed）**
   - 来源：`npx tsx prisma/seed.ts`（`deploy.stage.yml` 激活脚本）。
   - 原因：`prisma/seed.ts` 导入 `../lib/create-prisma-client`，但 tar 未包含 `lib/` 与 `generated/`；`lib/create-prisma-client.ts` 又导入 `../generated/prisma/client`，二者均缺失。

不在本次范围：`pm2: command not found`（用户明确指示不处理）。

## 涉及文件

- `.github/workflows/deploy.stage.yml`：tar 产物增加 `lib generated .env`，并加中文注释。
- `.github/workflows/deploy.production.yml`：无改动（production 不跑 migrate/seed）。
- `tests/deploy-workflows.test.ts`：新增失败契约测试。

## 实现步骤（TDD）

1. 在 `tests/deploy-workflows.test.ts` 新增失败测试：
   - stage 的 `tar -czf` 行包含 `.env`、`lib`、`generated`。
   - production 不新增 `prisma migrate deploy` / seed 行为不受影响（已有断言）。
2. 运行测试确认 Red（当前 tar 行缺少三个 token，断言失败）。
3. 修改 `deploy.stage.yml` 构建 tar 行，加入 `lib generated .env`，加注释说明"服务器端 migrate 与 seed 需要生成的客户端、共享工厂与数据库连接串"。
4. 运行测试确认 Green。
5. 运行 `npm run test:prisma` 与 `npm run lint` 验证零错误零警告。

## 注意事项

- 不改动 pm2 相关脚本。
- 不新增密钥到产物之外；`.env` 的密钥已通过 `.output/server/.env` 上线，无新增泄露面。
- `npm ci --omit=dev=false` 语法保持原样，不做本次范围的改动。
