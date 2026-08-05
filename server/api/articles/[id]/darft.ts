import { type Tag } from "../../../../generated/prisma/client";
// import { DarftData, type DarftResultType } from "~/api";

export default defineEventHandler(async(event) => {
  const _id = Number(getRouterParam(event, 'id'));

  const result = await prisma.article.findUnique({
    where: {
      id: _id
    },
    ...DarftData
  })

  const { id, parent, darft, darftId, status, ...article } = result!;
  const source = (darft ?? article) as typeof article & { tags: Tag[] };
  const { tags, ...draftResult } = source;

  // 新建返回对象而不是删除查询结果属性，避免依赖类型忽略并保持 API 结构明确。
  const response: DarftResultType = {
    ...draftResult,
    tagIds: tags.map(tag => tag.id),
    categoryId: draftResult.categoryId ?? 1,
    status,
    darftId: darftId ?? id ?? null,
    parentId: parent?.id ?? id ?? null,
  };

  if(status === 'OFFICIAL' && !darft){
    response.darftId = null;
  }
  if(status === 'DARFT' && !parent){
    response.parentId = null;
  }

  return responFormat(response)
})