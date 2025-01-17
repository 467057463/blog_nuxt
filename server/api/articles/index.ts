import prisma from "~/lib/prisma";
import { responFormat } from "~/server/utils/responFormat";
import { queryArticleSchema } from "~/constant/ApiRequestSchema";

export default defineCachedEventHandler(async (event) => {
  const { limit, page, ...query } = await getValidatedQuery(event, queryArticleSchema.parse)

  return responFormat({
    list: await prisma.article.findMany({
      where: query,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      omit: {
        authorId: true,
        updatedAt: true,
        categoryId: true
      },
      include: {
        author: {
          omit: {
            password: true,
            createdAt: true,
            updatedAt: true,
            role: true,
          },
          include: {
            profile: {
              omit: {
                createdAt: true,
                updatedAt: true,
              }
            }
          }
        },
        tags: true,
        category: true,
        parent: {
          select: {
            id: true
          }
        }
      }
    }),
    total: await prisma.article.count({
      where: query
    }),
    current: page
  })
})