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

test('production 不新增自动 migration 或 seed', async () => {
  const workflow = await readWorkflow('deploy.production.yml')
  const activeScript = workflow.replace(/^\s*#.*$/gm, '')

  assert.doesNotMatch(activeScript, /prisma migrate deploy/)
  assert.doesNotMatch(activeScript, /prisma\/seed\.ts/)
})
