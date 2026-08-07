# Electron 全量更新文件上传接口设计

日期：2026-08-07
状态：待审阅

## 背景与目标

为 Electron 客户端提供**全量更新文件上传**的专用接口。Electron 更新器（`latest.yml` + 安装包 + `.blockmap`）需要一组完整文件上传到 OSS，由更新器按 `latest.yml` 引用的文件名从 URL 下载。

本接口**仅**服务于 Electron 全量更新上传，不做通用文件上传。

## 需求澄清汇总

| 项 | 决策 |
|---|---|
| 接口定位 | 专用：仅 Electron 全量更新上传 |
| 接口名/路径 | `POST /api/electron_upload` |
| 鉴权 | 环境变量密钥 + HTTP 请求头 `x-upload-key`，各环境不同值 |
| 上传目录 | **固定** `electron_resource`，调用方不可自定义 |
| 文件名 | 保留原始文件名（`latest.yml` 引用一致） |
| 多文件 | 一次请求可上传多个文件 |
| 返回 | 成功返回 `responFormat({})`（空对象） |
| 重名 | 同目录同名覆盖旧文件（符合"全量更新"预期） |
| 部分失败 | 任一文件失败即整体返回错误 |

## 接口规范

### 请求

`POST /api/electron_upload`，`Content-Type: multipart/form-data`

- **header**：`x-upload-key: <密钥>`（必填）
- **body**：一个或多个文件字段（字段名不限，所有非空文件字段均视为待上传文件，覆盖安装包、`latest.yml`、`.blockmap` 等）

### 响应

统一走 `responFormat`（`{ code, data, msg }`）。

成功（`code: 0`）：

```json
{
  "code": 0,
  "data": {},
  "msg": "请求成功"
}
```

成功时 `data` 为空对象，不返回 URL 列表。

### 错误

| 场景 | 状态码 | code | msg |
|---|---|---|---|
| 密钥缺失/不匹配 | 401 | 100001 | 鉴权失败 |
| 无文件 | 400 | 100002 | 未接收到文件 |
| 文件名为空 | 400 | 100003 | 文件名为空 |
| 文件名含非法字符/路径穿越 | 400 | 100004 | 非法文件名 |
| 任一文件上传失败 | 500 | 100005 | 文件上传失败 |

## OSS key 规则

```
key = blog_data_{ossEnv}/electron_resource/{原始文件名}
```

- 固定目录 `electron_resource`
- 环境前缀 `blog_data_{ossEnv}`（`ossEnv` 来自 `runtimeConfig.ossEnv`）→ stage/production 更新包隔离，互不覆盖
- 保留原始文件名（与 `latest.yml` 引用一致），重名覆盖

## 校验

### 鉴权
`x-upload-key` 与 `runtimeConfig.uploadSecret`（读 `NUXT_UPLOAD_SECRET`）比对，不一致返回 401。

### 文件名
- 非空
- 拒绝 `/`、`\`、`..`
- 仅允许 `[A-Za-z0-9._\-]`
- 防目录注入与路径穿越

## 代码改动

| 文件 | 改动 |
|---|---|
| `nuxt.config.ts` | `runtimeConfig` 增加 `uploadSecret: process.env.NUXT_UPLOAD_SECRET` |
| `server/utils/oss.ts` | 新增 `oss.upload({ directory, filename, data })`，返回 `url`；保留现有 `oss.put` 不动 |
| `server/utils/uploadValidate.ts` | 新增：文件名校验 + 密钥比对 |
| `server/api/electron_upload.post.ts` | 新增：路由，解析 multipart、鉴权、校验、逐个上传 |
| `tests/upload-validate.test.ts` | 新增：文件名校验、鉴权比对、成功返回空对象 |

### 部署环境变量
- `NUXT_UPLOAD_SECRET` 各环境注入不同值（本地 `.env`、CI stage/production secrets）

## 测试计划

- 文件名校验：合法名通过；含 `/`、`\`、`..`、空、非白名单字符被拒
- 鉴权：密钥不匹配返回 401；匹配通过
- 成功返回：上传成功后 `data` 为空对象 `{}`

## 非目标（明确不做）

- 不做通用/任意目录上传
- 不做缩略图/图片处理
- 不提供下载、删除接口
- 不支持自定义文件存储规则
