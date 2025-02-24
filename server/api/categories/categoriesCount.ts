import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const { id: parentId } = await getValidatedQuery(event, queryCategorySchema.parse)

	return responFormat(await prisma.category.findMany({
		where: {
			parentId
		},
    
    include: {
      _count: {
        select: {
          articles: true
        }
      }
    }
	}))
})