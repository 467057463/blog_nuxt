import dayjs from 'dayjs'
import { createPrismaClient } from './create-prisma-client'

const prismaClientSingleton = () => {
  // 扩展只放在应用客户端上，seed 保持原始字段类型，避免脚本与业务返回值互相影响。
  return createPrismaClient().$extends({
    result: {
      article: {
        createdAt: {
          needs: { createdAt: true },
          compute(article) {
            return dayjs(article.createdAt).format('YYYY-MM-DD HH:mm')
          },
        },
      },
    },
  })
}

declare const globalThis: typeof global & {
  prismaGlobal?: ReturnType<typeof prismaClientSingleton>
}

// Nuxt 开发热更新会重复加载模块，全局缓存可避免创建多个数据库连接池。
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

export default prisma
