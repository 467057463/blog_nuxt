import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
	const id = Number(getRouterParam(event, 'id'));
	const body = await readBody(event);
	return prisma.tag.update({
		where: {
			id
		},
		data: body
	})
})