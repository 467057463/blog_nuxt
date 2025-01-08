import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
	const id = Number(getRouterParam(event, 'id'))
	return prisma.tag.delete({
		where: {
			id
		}
	})
})