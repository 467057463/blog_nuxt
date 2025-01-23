import prisma from "~/lib/prisma";
import { responFormat } from "~/server/utils/responFormat";
import { queryArticleListSchema, QueryArticleListItmeData } from '~/api'

export default defineCachedEventHandler(async (event) => {
  const { limit, page, ...query } = await getValidatedQuery(event, queryArticleListSchema.parse)

  const [total, list] = await prisma.$transaction([
    prisma.article.count({
      where: query
    }),
    prisma.article.findMany({
      where: query,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      ...QueryArticleListItmeData
    })
  ])

  

  return responFormat({
    total,
    list,
    current: page
  })
})