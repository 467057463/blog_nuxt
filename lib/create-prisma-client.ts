import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client'

export function createPrismaClient(databaseUrl = process.env.DATABASE_URL): PrismaClient {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL 未配置，无法初始化 Prisma Client')
  }

  const parsedUrl = new URL(databaseUrl)
  if (parsedUrl.protocol !== 'mysql:') {
    throw new Error('DATABASE_URL 必须使用 mysql: 协议')
  }

  // Prisma 7 不再内置数据库驱动，因此应用与脚本必须共享同一种 adapter 初始化方式。
  const adapter = new PrismaMariaDb(databaseUrl)
  return new PrismaClient({ adapter })
}
