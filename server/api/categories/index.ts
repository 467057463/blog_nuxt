import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
	return responFormat(await prisma.category.findMany({
		where: {
			parentId: null
		},
		include: {
			children: true
		}
	}))
})