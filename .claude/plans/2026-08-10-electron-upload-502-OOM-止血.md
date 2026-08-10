# 2026-08-10-electron-upload-502-OOM-止血.md

## 任务目标

修复 stage 环境 Electron 更新包上传（`POST /api/electron_upload`）返回 502 的问题。根因是 **服务器内存不足（1.7GB）** + pm2 `instances: 'max'` 起多实例导致内存爆掉，上传 102MB 时触发内核 OOM，进程被杀 → pm2 重启 → nginx 502。

本次为**止血**改动，仅调整部署配置，不改动上传代码。治本（流式上传）后续另行排期。

## 根因（已用日志与 dmesg 证实）

- 服务器物理内存 **1.7GB**，可用仅 ~626MB
- `ecosystem.stage.config.cjs` 配置 `exec_mode: 'cluster'` + `instances: 'max'`，在 1.7GB 机器上起满实例，每个实例 RSS ~800MB，叠加吃满整机
- 上传 102MB 时内存波动触发内核 OOM，`dmesg` 三次显示 `Out of memory: Killed process ... (node /var/www/b)`
- pm2 自动重启被杀实例 → nginx 在重启窗口返回 502

## 涉及文件

| 文件 | 改动 |
|---|---|
| `ecosystem.stage.config.cjs` | `instances: 'max'` → `1`（单实例），避免集群内存叠加吃爆整机 |
| `tests/ecosystem-config.test.ts` | 增加断言：stage `instances` 必须为固定值（1），防止回归 |

## 实现步骤

1. 修改 `ecosystem.stage.config.cjs`：`instances: 'max'` → `instances: 1`
2. 在 `tests/ecosystem-config.test.ts` 的 stage 测试里新增断言 `app.instances === 1`（Red：先确认当前测试在改动前对 `instances` 无约束，改后断言通过）
3. 运行 `npx tsx --test tests/ecosystem-config.test.ts` 验证

## 注意事项

- 只改 stage 配置；production 的 `instances` 若也是 `max` 需单独确认，本次不动（避免影响生产部署）
- 改完后需在服务器 `pm2 del` + `pm2 start ecosystem.stage.config.cjs` 生效，但此操作由用户执行，不在仓库改动范围内
- `instances: 1` 影响：stage 单实例，少量并发时无冗余，可接受
