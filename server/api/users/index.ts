import prisma from "~/lib/prisma"

export default defineEventHandler(async(event) => {
    const user = await useRquestUser(event);
    console.log(user)
    return prisma.user.findMany()
})