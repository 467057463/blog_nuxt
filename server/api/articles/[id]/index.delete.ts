import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
	const id = Number(getRouterParam(event, 'id'))

  await prisma.article.delete({
    where: {
			id
		}
  })

  return responFormat(null)
})