import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
	const id = Number(getRouterParam(event, 'id'))
	return prisma.user.delete({
		where: {
			id
		}
	})
})