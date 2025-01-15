import prisma from "~/lib/prisma";
import { responFormat } from "~/server/utils/responFormat";

export default defineCachedEventHandler(async (event) => {
  return responFormat({
    list: await prisma.article.findMany({
      include: {
        author: true
      }
    }),
    total: 10,
    current: 1
  })
})