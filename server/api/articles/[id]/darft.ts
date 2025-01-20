import { Tag } from "@prisma/client";
import prisma from "~/lib/prisma";
import { responFormat } from "~/server/utils/responFormat";
import type { DarftDetailType } from '~/constant/ApiRequestSchema';

export default defineEventHandler(async(event) => {
  const _id = Number(getRouterParam(event, 'id'));

  const result = await prisma.article.findUnique({
    where: {
      id: _id
    },
    omit: {
      createdAt: true,
      updatedAt: true
    },
    include: {
      tags: true,
      parent: {
        select: {
          id: true
        }
      },
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

  const { id, parent, darft, darftId, status, ...article } = result!;
  let res: DarftDetailType = (darft ?? article) as unknown as DarftDetailType;
  
  res.tagIds = (res as any).tags.map((i: Tag) => i.id);
  res.categoryId = res.categoryId ?? 1;
  // @ts-ignore
  res.id = undefined;
  // @ts-ignore
  res.tags = undefined;
  res.status = status;
  res.darftId = darftId ?? id ?? null;
  res.parentId = parent?.id ?? id ?? null;
  if(status === 'OFFICIAL' && !darft){
    res.darftId = null;
  }
  if(status === 'DARFT' && !parent){
    res.parentId = null;
  }

  return responFormat(res)
})