import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
	const { categoryId } = await getValidatedQuery(event, QueryTagSchema.parse)
	return responFormat(await prisma.tag.findMany({
		where: {
			categoryId
		}
	}))
})