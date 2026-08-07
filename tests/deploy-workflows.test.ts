import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readWorkflow = (name: string) =>
  readFile(new URL(`../.github/workflows/${name}`, import.meta.url), 'utf8')

for (const name of ['deploy.stage.yml', 'deploy.production.yml']) {
  test(`${name} 使用 Node 22.12.0 和确定性安装`, async () => {
    const workflow = (await readWorkflow(name)).replace(/^\s*#.*$/gm, '')

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

test('stage 部署产物包含 seed 依赖与数据库连接配置', async () => {
  const workflow = await readWorkflow('deploy.stage.yml')
  // 服务器端 seed 依赖生成客户端与共享工厂，prisma CLI 依赖根 .env 解析 DATABASE_URL。
  const tarLine = workflow
    .split('\n')
    .find(line => line.includes('tar -czf'))

  assert.ok(tarLine, 'stage 工作流应包含构建部署产物的 tar 命令')
  assert.match(tarLine, /(^|\s)\.env(\s|$)/)
  assert.match(tarLine, /(^|\s)lib(\s|$)/)
  assert.match(tarLine, /(^|\s)generated(\s|$)/)
  // 服务器 VPN 差无法 npm install，故 node_modules 必须随产物离线下发（dotenv/prisma/tsx 依赖服务器本地解析）。
  assert.match(tarLine, /(^|\s)node_modules(\s|$)/)
})

test('production 不新增自动 migration 或 seed', async () => {
  const workflow = await readWorkflow('deploy.production.yml')
  const activeScript = workflow.replace(/^\s*#.*$/gm, '')

  assert.doesNotMatch(activeScript, /prisma migrate deploy/)
  assert.doesNotMatch(activeScript, /prisma\/seed\.ts/)
})
