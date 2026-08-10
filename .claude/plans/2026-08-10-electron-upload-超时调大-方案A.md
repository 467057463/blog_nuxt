# 2026-08-10-electron-upload-超时调大(方案A).md

## 任务目标

解决 Electron 大文件（102MB）上传 504 超时问题。

已确认根因：慢网络（服务器 VPN 差）下，102MB 单块经 `putStream` 上传到 OSS，**OSS client `timeout: '60s'` 超时**（`ResponseTimeoutError for 60000ms`），随后进程返回错误、nginx 在 `proxy_read_timeout`（默认 60s）也超时返回 504。

## 方案 A（本计划）：调大超时

最小改动，保留 `putStream` 流式上传，先验证慢网络真实耗时。

### 涉及文件

| 文件 | 改动 |
|---|---|
| `server/utils/oss.ts` | `timeout: '60s'` → `'300s'`（OSS client 上传超时） |
| 服务器 nginx 配置 | `proxy_read_timeout` / `proxy_send_timeout` 调到 300s（用户操作） |

### 实现步骤

1. 改 `server/utils/oss.ts` 的 `timeout: '60s'` → `'300s'`
2. 跑测试 + ESLint 验证（oss.ts 无新增错误）
3. 用户配置 nginx `proxy_read_timeout 300s; proxy_send_timeout 300s;` 并 reload
4. 重新构建部署，跑一次 leigod-tools-plus publish 验证

### 注意事项

- nginx 配置在服务器上，不在仓库，由用户执行
- `timeout: '300s'` 是 OSS 请求级超时；若上传仍需 >300s 再调大或转方案 B
- 仅改 stage；production 是否同样调整待确认
