export default defineEventHandler(async (event) => {
  const body = await readBody(event, CreateCategorySchema.parse)
  const result = await prisma.category.create({
    data: body
  })  
  return responFormat(result)
})