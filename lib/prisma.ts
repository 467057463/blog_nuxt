import { PrismaClient } from '@prisma/client'
import dayjs from 'dayjs'

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    result: {
      article: {
        createdAt: {
          needs: {
            createdAt: true
          },
          compute(article){
            return dayjs(article.createdAt).format('YYYY-MM-DD HH:mm')
          }
        }
      }
    }
  })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
