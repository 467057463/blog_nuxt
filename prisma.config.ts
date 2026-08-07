// import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Prisma 7 将 CLI 数据源与生成器解耦，避免 schema 和部署脚本各自维护连接地址。
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // url: env('DATABASE_URL'),
    url: 'mysql://root:nandudu_@127.0.0.1:3306/blog_development_1'
  },
})
