import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  return prisma.tag.create({
    data: {
      name: 'css',
      label: 'css'
    }
  })
})