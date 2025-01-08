import prisma from "~/lib/prisma"

export default defineEventHandler(auth(async (event) => {
	const id = Number(getRouterParam(event, 'id'))
	return prisma.user.findUnique({
		where: {
			id
		}
	})
}))