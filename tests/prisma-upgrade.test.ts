import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { createPrismaClient } from '../lib/create-prisma-client'

const readProjectFile = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Prisma 依赖固定为目标版本', async () => {
  const packageJson = JSON.parse(await readProjectFile('package.json'))

  assert.equal(packageJson.dependencies['@prisma/client'], '7.9.1')
  assert.equal(packageJson.dependencies['@prisma/adapter-mariadb'], '7.9.1')
  assert.equal(packageJson.dependencies['@prisma/nuxt'], '0.3.0')
  assert.equal(packageJson.devDependencies.prisma, '7.9.1')
})

test('Prisma 7 schema 使用显式输出且不保存 datasource URL', async () => {
  const schema = await readProjectFile('prisma/schema.prisma')

  assert.match(schema, /provider\s*=\s*"prisma-client"/)
  assert.match(schema, /output\s*=\s*"\.\.\/generated\/prisma"/)
  assert.doesNotMatch(schema, /url\s*=\s*env\("DATABASE_URL"\)/)
})

test('Node 运行时固定为 22.12.0', async () => {
  const packageJson = JSON.parse(await readProjectFile('package.json'))
  const nvmrc = (await readProjectFile('.nvmrc')).trim()

  assert.equal(packageJson.engines.node, '>=22.12.0 <23')
  assert.equal(nvmrc, '22.12.0')
})

test('Prisma CLI 配置包含 schema、migration、seed 和 datasource', async () => {
  const config = await readProjectFile('prisma.config.ts')

  assert.match(config, /schema:\s*['"]prisma\/schema\.prisma['"]/)
  assert.match(config, /path:\s*['"]prisma\/migrations['"]/)
  assert.match(config, /seed:\s*['"]tsx prisma\/seed\.ts['"]/)
  assert.match(config, /url:\s*env\(['"]DATABASE_URL['"]\)/)
})

test('依赖安装不要求提前配置数据库地址', async () => {
  const packageJson = JSON.parse(await readProjectFile('package.json'))

  assert.equal(packageJson.scripts.postinstall, 'nuxt prepare')
  assert.equal(packageJson.scripts['prisma:generate'], 'prisma generate')
})

test('合法 MySQL URL 可以创建 Prisma Client', async () => {
  const client = createPrismaClient('mysql://user:p%40ss@127.0.0.1:3307/blog')

  assert.equal(typeof client.$connect, 'function')
  assert.equal(typeof client.$disconnect, 'function')
  await client.$disconnect()
})

test('缺少 DATABASE_URL 时立即抛出明确错误', () => {
  assert.throws(
    () => createPrismaClient(''),
    /DATABASE_URL 未配置/,
  )
})

test('非 MySQL 协议不会被静默接受', () => {
  assert.throws(
    () => createPrismaClient('postgresql://user:pass@localhost/blog'),
    /DATABASE_URL 必须使用 mysql: 协议/,
  )
})

test('应用单例复用共享工厂并保留日期扩展', async () => {
  const source = await readProjectFile('lib/prisma.ts')

  assert.match(source, /createPrismaClient\(\)\.\$extends/)
  assert.match(source, /dayjs\(article\.createdAt\)\.format\('YYYY-MM-DD HH:mm'\)/)
  assert.match(source, /globalThis\.prismaGlobal/)
  assert.doesNotMatch(source, /from ['"]@prisma\/client['"]/)
})

test('seed 使用独立共享工厂并保证断开连接', async () => {
  const source = await readProjectFile('prisma/seed.ts')

  assert.match(source, /createPrismaClient\(\)/)
  assert.doesNotMatch(source, /new PrismaClient\(/)
  assert.match(source, /await prisma\.\$disconnect\(\)/)
})

test('业务代码只从生成客户端导入 Prisma 类型', async () => {
  const files = [
    'api/article.ts',
    'components/ArticleEditer.vue',
    'lib/prisma.ts',
    'prisma/seed.ts',
    'server/api/articles/[id]/darft.ts',
  ]

  for (const file of files) {
    const source = await readProjectFile(file)
    assert.doesNotMatch(source, /from ['"]@prisma\/client['"]/, file)
  }
})

test('Nuxt 暂停加载尚不兼容 Prisma 7 的模块', async () => {
  const source = await readProjectFile('nuxt.config.ts')

  assert.doesNotMatch(source, /['"]@prisma\/nuxt['"],?\s*$/m)
  assert.doesNotMatch(source, /\.prisma\/client\/index-browser/)
  assert.match(source, /Prisma 7.*adapter/)
})

test('锁文件解析到唯一的 Prisma 7.9.1 核心版本', async () => {
  const lock = JSON.parse(await readProjectFile('package-lock.json'))

  assert.equal(lock.packages['node_modules/@prisma/client'].version, '7.9.1')
  assert.equal(lock.packages['node_modules/@prisma/adapter-mariadb'].version, '7.9.1')
  assert.equal(lock.packages['node_modules/prisma'].version, '7.9.1')
})
