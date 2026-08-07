import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

// 部署工作流每次部署都会重跑 prisma/seed.ts，因此 seed 必须幂等。
// 所有 category/tag 的 createMany 都必须带 skipDuplicates，否则二次部署会因唯一约束冲突(P2002)崩溃。
test('seed 中每个 category/tag createMany 都必须带 skipDuplicates', async () => {
  const seed = await readFile(new URL('../prisma/seed.ts', import.meta.url), 'utf8')

  const segments = seed.split(/await prisma\./)
  let checked = 0
  for (const seg of segments) {
    if (/^(category|tag)\.createMany/.test(seg.trim())) {
      assert.match(
        seg,
        /skipDuplicates/,
        '每个 category/tag createMany 必须带 skipDuplicates 以保持幂等（可重复执行）'
      )
      checked++
    }
  }

  // 至少覆盖到 category(3处) 与 tag(1处)
  assert.ok(checked >= 4, '应检查到全部 category/tag createMany 调用')
})
