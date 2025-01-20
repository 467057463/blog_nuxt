import { Article } from "@prisma/client";
import { editArticleSchema } from "~/constant/ApiRequestSchema";
import prisma from "~/lib/prisma";
import { readValidateFormData } from "~/server/utils/readValidateFormData";


export default defineEventHandler(async(event) => {
  const user = await useRquestUser(event);
  const { parentId, darftId, tagIds, ...body } = await readValidateFormData(event, editArticleSchema);

  // 上传到 oss
  const coverUrl = body.cover ? await oss.put(body.cover).then(res => res?.url ?? '') : '';
  
  let updateData = {
    ...body,
    authorId: user.id,

    tags: {
      connect: tagIds
    },
  }

  if(coverUrl){
    updateData.cover = coverUrl
  }

  // 保存为正文
  if(body.status === "OFFICIAL"){
    if(darftId){
      await prisma.article.delete({
        where: {
          id: darftId
        }
      })
    }
    const _updateData = {
      ...updateData,
      darftId: null,
    }
    const article = await prisma.article.upsert({
      where: {
        id: parentId ?? 0
      },
      update: _updateData,
      create: _updateData
    })
    return responFormat(article)
  // 保存为草稿
  } else {
    const darft = await prisma.article.upsert({
      where: {
        id: darftId ?? 0
      },
      update: updateData,
      create: updateData
    })
    if(!darftId && parentId){
      await prisma.article.update({
        where: {
          id: parentId
        },
        data: {
          darftId: darft.id
        }
      })
    }
    return responFormat(darft)
  }
})