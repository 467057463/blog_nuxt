
export default defineEventHandler(async (event) => {
  const body = await readBody(event, CreateTagSchema.parse)
  const result = await prisma.tag.create({
    data: body
  })
  return responFormat(result)
})