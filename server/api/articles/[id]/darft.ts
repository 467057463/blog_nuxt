import { Tag } from "@prisma/client";
import prisma from "~/lib/prisma";
import { responFormat } from "~/server/utils/responFormat";
import { DarftData, type DarftResultType } from "~/api";

export default defineEventHandler(async(event) => {
  const _id = Number(getRouterParam(event, 'id'));

  const result = await prisma.article.findUnique({
    where: {
      id: _id
    },
    ...DarftData
  })

  const { id, parent, darft, darftId, status, ...article } = result!;
  let res: DarftResultType = (darft ?? article) as unknown as DarftResultType;
  
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