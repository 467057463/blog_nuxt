# 2026-08-10-electron-upload-流式上传治本.md

## 任务目标

根治 `POST /api/electron_upload` 上传大文件（102MB）触发 OOM 的问题。

现状根因（已证实）：`readMultipartFormData` 把整个 multipart body **一次性读进内存**成为 `Buffer[]`，加上 OSS 上传又持有一份 data，内存峰值远超 1.7GB 机器余量，被内核 OOM 强杀。

止血方案（已完成）：`ecosystem.stage.config.cjs` `instances: 'max'` → `1`，只是腾出机器余量，**102MB 仍驻留内存**，未根治。

治本方案：**流式解析 multipart + 流式上传 OSS**，内存占用恒定在缓冲区大小，不再随文件体积增长。

## 方案设计

### 现状
- `server/api/electron_upload.post.ts`：`readMultipartFormData(event)` → `Buffer[]` → `oss.upload({data})`（全量驻留内存）
- `server/utils/oss.ts`：`oss.upload` 用 `client.put(key, data)`（Buffer 整块上传）
- 无流式 multipart 解析器（无 busboy）

### 改动
1. **新增依赖 `busboy`**（流式 multipart 解析），写入 `package.json` dependencies
2. `server/utils/oss.ts`：新增 `oss.uploadStream({directory, filename, stream})`，用 `client.multipartUpload(key, stream, { partSize })` 或 `putStream` 分片/流式上传，返回 url；保留现有 `oss.put`/`oss.upload` 不动
3. `server/api/electron_upload.post.ts`：改用 `event.node.req` + `busboy` 流式解析，对每个文件字段实时校验文件名并流式上传，避免整块驻留内存
4. 错误处理与鉴权逻辑保持：header `x-upload-key` 鉴权、文件名校验、任一失败整体报错、成功返回空对象

### 依赖部署说明
`busboy` 加入后，CI `npm ci` 会安装并随 `node_modules` 离线打包下发，服务器无需 npm install（符合离线部署硬约束）。需重新构建触发一次 CI。

## 测试计划（TDD）

纯函数层可复用 `tests/upload-validate.test.ts`（校验/key 拼接已覆盖）。新增：
- OSS key 拼接/校验：已覆盖，无需改
- 新增 `tests/upload-stream.test.ts`：测 `oss.uploadStream` 的 key 拼接正确性（用 mock 注入，不真连 OSS）；测 busboy 文件名校验仍复用 `validateUploadFilename`

路由层（h3 事件构造较复杂）以手动/集成验证为主，与现有测试模式一致（现有测试只覆盖纯函数层）。

## 涉及文件清单

| 文件 | 改动 |
|---|---|
| `package.json` | 新增 `busboy` 依赖 |
| `server/utils/oss.ts` | 新增 `oss.uploadStream` |
| `server/api/electron_upload.post.ts` | 改流式解析+流式上传 |
| `tests/upload-stream.test.ts` | 新增（OSS 封装单测） |

## 注意事项

- `server/` 大部分不在 `npm run lint` 范围，改后需手动对改动文件跑 `npx eslint --max-warnings=0 <files>`
- 保留 `oss.put`/`oss.upload` 不动，避免影响现有调用
- 不新增其他依赖，最小改动
- 完成后需 CI 重新构建下发，服务器重启生效
