import prisma from "~/lib/prisma";
import { responFormat } from "~/server/utils/responFormat";
import { QueryArticleListItmeData } from "~/api";

export default defineEventHandler(async(event) => {
  const id = Number(getRouterParam(event, 'id'));

  return responFormat(await prisma.article.findUnique({
    where: {
      status: "OFFICIAL",
      id: id
    },
    ...QueryArticleListItmeData
  }))
})  