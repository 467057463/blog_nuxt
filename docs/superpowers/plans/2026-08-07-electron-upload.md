# Electron 全量更新上传接口实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 `POST /api/electron_upload` 专用接口，将 Electron 全量更新文件（安装包、`latest.yml`、`.blockmap`）上传到 OSS 固定目录 `electron_resource`。

**Architecture:** 核心校验与 key 拼接做成 `server/utils/uploadValidate.ts` 纯函数（可单测）；`server/utils/oss.ts` 复用现有 OSS client 新增 `oss.upload`；路由 `server/api/electron_upload.post.ts` 只做鉴权、解析 multipart、调用工具、聚合返回。鉴权走 `NUXT_UPLOAD_SECRET` 环境变量 + `x-upload-key` header。

**Tech Stack:** Nuxt 3 (Nitro/h3)、ali-oss、node:test

## Global Constraints

- 接口路径固定 `POST /api/electron_upload`
- OSS 目录固定 `electron_resource`，调用方不可自定义
- 保留原始文件名；重名覆盖
- 环境前缀 `blog_data_{ossEnv}`（`ossEnv` 来自 `runtimeConfig.ossEnv`）
- 成功返回 `responFormat({})`（`{ code: 0, data: {}, msg }`），不返回 URL
- 任一文件失败即整体返回错误
- 鉴权密钥 `NUXT_UPLOAD_SECRET`，各环境不同值
- 所有代码/注释使用中文；不得引入 ESLint 错误

---

### Task 1: 上传校验纯函数（TDD）

**Files:**
- Create: `server/utils/uploadValidate.ts`
- Test: `tests/upload-validate.test.ts`

**Interfaces:**
- Consumes: 无（独立纯函数）
- Produces:
  - `validateUploadFilename(filename: string): boolean`
  - `buildUploadKey(ossEnv: string, directory: string, filename: string): string`
  - `checkUploadKey(key: string | undefined, secret: string | undefined): boolean`

- [ ] **Step 1: 写失败测试**

`tests/upload-validate.test.ts`：

```ts
import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildUploadKey,
  checkUploadKey,
  validateUploadFilename,
} from '../server/utils/uploadValidate'

test('validateUploadFilename 放行合法文件名', () => {
  assert.equal(validateUploadFilename('app-1.0.0.exe'), true)
  assert.equal(validateUploadFilename('latest.yml'), true)
  assert.equal(validateUploadFilename('update_2026.blockmap'), true)
})

test('validateUploadFilename 拒绝路径穿越与非法字符', () => {
  assert.equal(validateUploadFilename(''), false)
  assert.equal(validateUploadFilename('a/../b.exe'), false)
  assert.equal(validateUploadFilename('a\\b.exe'), false)
  assert.equal(validateUploadFilename('a b.exe'), false)
  assert.equal(validateUploadFilename('../etc/passwd'), false)
})

test('buildUploadKey 按环境前缀+固定目录+原文件名拼接', () => {
  assert.equal(
    buildUploadKey('stage', 'electron_resource', 'latest.yml'),
    'blog_data_stage/electron_resource/latest.yml'
  )
})

test('checkUploadKey 只有完全匹配才通过', () => {
  assert.equal(checkUploadKey('secret123', 'secret123'), true)
  assert.equal(checkUploadKey('wrong', 'secret123'), false)
  assert.equal(checkUploadKey(undefined, 'secret123'), false)
  assert.equal(checkUploadKey('secret123', undefined), false)
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx tsx --test tests/upload-validate.test.ts`
Expected: FAIL（模块/函数不存在）

- [ ] **Step 3: 最小实现**

`server/utils/uploadValidate.ts`：

```ts
// Electron 更新文件名校验与 OSS key 拼接。抽成纯函数以便单测，路由层只做调用。
export function validateUploadFilename (filename: string): boolean {
  if (!filename) return false
  // 拒绝路径穿越与分隔符，防止目录注入
  if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) return false
  // 仅允许常见文件名字符（字母/数字/点/下划线/中划线）
  return /^[A-Za-z0-9._\-]+$/.test(filename)
}

export function buildUploadKey (ossEnv: string, directory: string, filename: string): string {
  // 环境前缀隔离 stage/production，固定目录承载更新包，保留原始文件名
  return `blog_data_${ossEnv}/${directory}/${filename}`
}

export function checkUploadKey (key: string | undefined, secret: string | undefined): boolean {
  // 密钥必须已配置且完全一致，避免空值误放行
  return !!secret && !!key && key === secret
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx tsx --test tests/upload-validate.test.ts`
Expected: 4 个用例全部 PASS

- [ ] **Step 5: 提交**

```bash
git add server/utils/uploadValidate.ts tests/upload-validate.test.ts
git commit -m "feat: 上传校验纯函数（文件名校验/key 拼接/鉴权比对）"
```

---

### Task 2: 配置 uploadSecret 并新增 oss.upload

**Files:**
- Modify: `nuxt.config.ts`（runtimeConfig）
- Modify: `server/utils/oss.ts`

**Interfaces:**
- Consumes: `buildUploadKey`（来自 Task 1）、`useRuntimeConfig().ossEnv`
- Produces: `oss.upload({ directory: string, filename: string, data: Buffer }): Promise<string | null>`；`runtimeConfig.uploadSecret: string | undefined`

- [ ] **Step 1: runtimeConfig 增加 uploadSecret**

`nuxt.config.ts` 的 `runtimeConfig` 加入一行（在 `ossAccessKeySecret` 之后）：

```ts
    uploadSecret: process.env.NUXT_UPLOAD_SECRET,
```

- [ ] **Step 2: oss.ts 新增 upload 方法**

在 `server/utils/oss.ts` 的 `export const oss = { ... }` 内、`put` 之后新增：

```ts
  // 供 Electron 更新上传复用同一 OSS client。directory 由路由层固定传入，key 保留原始文件名。
  async upload ({ directory, filename, data }: { directory: string, filename: string, data: Buffer }){
    const config = useRuntimeConfig();
    try {
      const key = buildUploadKey(config.ossEnv, directory, filename);
      const result = await useClient().put(key, data)
      return result.url as string
    } catch (error) {
      console.error(error)
      return null
    }
  }
```

并在文件顶部导入 `buildUploadKey`：

```ts
import { buildUploadKey } from './uploadValidate'
```

- [ ] **Step 3: 运行既有测试确认无回归**

Run: `npx tsx --test tests/upload-validate.test.ts tests/prisma-upgrade.test.ts`
Expected: 全部 PASS

- [ ] **Step 4: 提交**

```bash
git add nuxt.config.ts server/utils/oss.ts
git commit -m "feat: 新增 oss.upload 与 uploadSecret 配置"
```

---

### Task 3: electron_upload 路由

**Files:**
- Create: `server/api/electron_upload.post.ts`

**Interfaces:**
- Consumes: `checkUploadKey`、`validateUploadFilename`、`buildUploadKey`（Task 1）；`oss.upload`（Task 2）；`responFormat`、`getHeader`、`readMultipartFormData`、`setResponseStatus`
- Produces: `POST /api/electron_upload` 端点

- [ ] **Step 1: 写路由**

`server/api/electron_upload.post.ts`：

```ts
import { checkUploadKey, validateUploadFilename } from '../utils/uploadValidate'

// Electron 全量更新上传：鉴权 -> 取文件 -> 校验文件名 -> 逐个上传 -> 成功返回空对象。
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // 1. 鉴权：header 密钥须匹配当前环境 NUXT_UPLOAD_SECRET
  if (!checkUploadKey(getHeader(event, 'x-upload-key'), config.uploadSecret)) {
    setResponseStatus(event, 401)
    return responFormat(null, 100001, '鉴权失败')
  }

  // 2. 解析 multipart，仅取带 filename 的文件字段
  const multi = await readMultipartFormData(event)
  const files = multi?.filter(item => item.filename) ?? []
  if (files.length === 0) {
    setResponseStatus(event, 400)
    return responFormat(null, 100002, '未接收到文件')
  }

  // 3. 逐个校验文件名，任一非法即整体失败
  for (const file of files) {
    if (!validateUploadFilename(file.filename!)) {
      setResponseStatus(event, 400)
      return responFormat(null, 100004, '非法文件名')
    }
  }

  // 4. 逐个上传，任一失败即整体返回错误（避免更新链缺文件）
  for (const file of files) {
    const url = await oss.upload({
      directory: 'electron_resource',
      filename: file.filename!,
      data: file.data,
    })
    if (!url) {
      setResponseStatus(event, 500)
      return responFormat(null, 100005, '文件上传失败')
    }
  }

  // 5. 成功：空对象
  return responFormat({})
})
```

- [ ] **Step 2: 运行全量测试确认无回归**

Run: `npx tsx --test tests/upload-validate.test.ts tests/prisma-upgrade.test.ts tests/deploy-workflows.test.ts tests/ecosystem-config.test.ts tests/seed-idempotency.test.ts`
Expected: 全部 PASS

- [ ] **Step 3: 提交**

```bash
git add server/api/electron_upload.post.ts
git commit -m "feat: 新增 electron_upload 上传路由"
```

---

### Task 4: 收尾验证

**Files:**
- None (verification only)

- [ ] **Step 1: ESLint 检查所有新增/改动文件**

Run: `npx eslint --max-warnings=0 server/utils/uploadValidate.ts server/utils/oss.ts server/api/electron_upload.post.ts nuxt.config.ts tests/upload-validate.test.ts`
Expected: 0 errors, 0 warnings

- [ ] **Step 2: 完整测试套件**

Run: `npm run test:prisma && npx tsx --test tests/upload-validate.test.ts tests/ecosystem-config.test.ts tests/seed-idempotency.test.ts`
Expected: 全部 PASS

- [ ] **Step 3: 人工冒烟（本地 .env 设 NUXT_UPLOAD_SECRET）**

Run: `npm run dev`，然后：

```bash
curl -X POST http://localhost:3000/api/electron_upload \
  -H "x-upload-key: <你的密钥>" \
  -F "file=@./README.md" \
  -F "latest=@./package.json"
```
Expected: `{"code":0,"data":{},"msg":"请求成功"}`；错误密钥返回 401 `code:100001`

- [ ] **Step 4: 提交（如有遗留改动）**

```bash
git add -A && git commit -m "chore: electron_upload 冒烟通过" || true
```
