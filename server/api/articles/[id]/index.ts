import prisma from "~/lib/prisma";
import { responFormat } from "~/server/utils/responFormat";

export default defineEventHandler(async(event) => {
  const id = Number(getRouterParam(event, 'id'));

  return responFormat(await prisma.article.findUnique({
    where: {
      status: "OFFICIAL",
      id: id
    },
    include: {
      author: true
    }
  }))
})  