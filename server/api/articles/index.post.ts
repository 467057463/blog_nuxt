import { createArticleSchem } from "~/constant/ApiRequestSchema";
import prisma from "~/lib/prisma";
import { decode } from 'decode-formdata';

export default defineEventHandler(async(event) => {
  const user = await useRquestUser(event);
  const formData = decode(await readFormData(event), {
    numbers: ['categoryId']
  }) as any;
  formData.tags = formData.tags.length ? formData.tags.split(",").map(Number): undefined
  const result = formData.cover? await oss.put(formData.cover) : null;
  const { tags, ...res } = await createArticleSchem.parse(formData)
  const article = await prisma.article.create({
    data: {
      ...res,
      authorId: user.id,
      cover: result?.url ?? undefined,
      tags: tags?.length ? {
        connect: tags?.map(i => ({id: i}))
      } : undefined
    }
  })

  return responFormat(article)
})