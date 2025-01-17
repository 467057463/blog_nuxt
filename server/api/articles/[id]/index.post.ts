import { createArticleSchem } from "~/constant/ApiRequestSchema";
import prisma from "~/lib/prisma";
import { decode } from 'decode-formdata';

export default defineEventHandler(async(event) => {
  const id = Number(getRouterParam(event, 'id'));
  const user = await useRquestUser(event);

  const formData = decode(await readFormData(event), {
    numbers: ['categoryId']
  }) as any;

  formData.tags = formData.tags.length ? formData.tags.split(",").map(Number): undefined
  const result = formData.cover? await oss.put(formData.cover) : null;
  const { tags, ...res } = await createArticleSchem.parse(formData)

  const article = await prisma.article.findUnique({
    where: {
      id
    },
    include: {
      parent: true,
      darft: true
    }
  })


  // 草稿
  if(res.status === 'DARFT'){
    if(article?.status === 'DARFT'){
      await prisma.article.update({
        where: {id},
        data: {
          ...res,
          authorId: user.id,
          cover: result?.url ?? undefined,
          tags: tags?.length ? {
            connect: tags?.map(i => ({id: i}))
          } : undefined
        }
      })
    } else {
      if(article?.darft){
        await prisma.article.update({
          where: {
            id: article.darft.id
          },
          data: {
            ...res,
            authorId: user.id,
            cover: result?.url ?? undefined,
            tags: tags?.length ? {
              connect: tags?.map(i => ({id: i}))
            } : undefined
          }
        })
      } else {
        const darft = await prisma.article.create({
          data: {
            ...res,
            authorId: user.id,
            cover: result?.url ?? undefined,
            tags: tags?.length ? {
              connect: tags?.map(i => ({id: i}))
            } : undefined
          }
        })
  
        await prisma.article.update({
          where: { id },
          data: {
            darftId: darft.id
          }
        })
      }
    }
  } else {
    // 正文
    if(article?.status === 'DARFT'){
      if(article.parent){
        await prisma.article.update({
          where: {
            id: article.parent.id
          },
          data: {
            ...res,
            authorId: user.id,
            cover: result?.url ?? undefined,
            tags: tags?.length ? {
              connect: tags?.map(i => ({id: i}))
            } : undefined,
            darftId: null
          }
        })
        await prisma.article.delete({
          where: {id}
        })
      } else {
        await prisma.article.update({
          where: {id},
          data: {
            ...res,
            authorId: user.id,
            cover: result?.url ?? undefined,
            tags: tags?.length ? {
              connect: tags?.map(i => ({id: i}))
            } : undefined,
          }
        })
      }
    } else {
      await prisma.article.update({
        where: {id},
        data: {
          ...res,
          authorId: user.id,
          cover: result?.url ?? undefined,
          tags: tags?.length ? {
            connect: tags?.map(i => ({id: i}))
          } : undefined,
        }
      })
    }
  }

  return responFormat(null)
})