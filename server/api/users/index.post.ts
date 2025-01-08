import prisma from "~/lib/prisma"

const saltRounds = 10;
export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)
  return prisma.user.create({
    data: {
      username,
      password: await hashPassword(password)
    }
  })
})