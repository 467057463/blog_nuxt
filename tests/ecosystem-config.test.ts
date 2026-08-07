import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import { isAbsolute, resolve } from 'node:path'

const require = createRequire(import.meta.url)

// 服务器 VPN 差、无法 npm install，因此 .env 必须由 node 启动时本地加载，
// 端口也必须显式注入（pm2 的 port 字段不会写进进程环境变量）。
function loadApp (name: 'stage' | 'production') {
  const config = require(`../ecosystem.${name}.config.cjs`)
  const apps = Array.isArray(config.apps) ? config.apps : [config]
  return apps[0]
}

// 解析 --env-file=<path> 里的路径部分
function envFileOf (app: { node_args?: string }) {
  const match = (app.node_args ?? '').match(/--env-file=([^ ]+)/)
  return match ? match[1] : ''
}

test('stage ecosystem 通过 --env-file 加载 .env 且显式指定端口', () => {
  const app = loadApp('stage')

  // 运行时依赖（DATABASE_URL、NUXT_SESSION_PASSWORD 等）必须从 release 根 .env 加载
  const envFile = envFileOf(app)
  assert.ok(envFile, 'stage 应用必须配置 --env-file')
  // 必须用绝对路径：pm2 启动的 node 进程 cwd 不可靠，相对路径(.env)会找不到文件
  assert.ok(isAbsolute(envFile), '--env-file 必须是绝对路径（不得依赖进程 cwd）')
  // env-file 必须指向 release 根（config 所在目录）下的 .env
  assert.equal(resolve(envFile), resolve(app.cwd ?? '', '.env'))
  // 固定工作目录到 release 根，确保脚本相对路径可靠
  assert.ok(app.cwd, 'stage 应用应显式设置 cwd')
  // pm2 的 port 字段只是元数据，真正的监听端口必须通过 env.PORT 注入
  assert.equal(app.env?.PORT, '3001')
  assert.match(app.script, /\.output\/server\/index\.mjs/)
})

test('production ecosystem 保持不使用运行时 .env 注入', () => {
  const app = loadApp('production')
  assert.doesNotMatch(app.node_args ?? '', /--env-file/)
})
