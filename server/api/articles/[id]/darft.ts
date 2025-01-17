import prisma from "~/lib/prisma";
import { responFormat } from "~/server/utils/responFormat";

export default defineEventHandler(async(event) => {
  const id = Number(getRouterParam(event, 'id'));

  const darft = await prisma.article.findUnique({
    where: {
      id
    },
    omit: {
      createdAt: true,
      updatedAt: true
    },
    include: {
      tags: true,
      parent: true,
      darft: {
        omit: {
          createdAt: true,
          updatedAt: true
        },
        include: {
          tags: true,
        }
      }
    }
  })

  return responFormat(darft)
})