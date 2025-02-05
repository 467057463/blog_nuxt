export default defineCachedEventHandler(async (event) => {
  let { limit, page, ...query } = await getValidatedQuery(event, queryArticleListSchema.parse)


  if(query.mainCategoryId){
    const category = await prisma.category.findUnique({
      where: {
        id: query.mainCategoryId
      },
      include: {
        children: true
      }
    })
    const childrenCategoryIds = category?.children.map(i => i.id);
    delete query.mainCategoryId;
    query.categoryId = {
      in: childrenCategoryIds
    } as any
  }
  
  
  const [total, list] = await prisma.$transaction([
    prisma.article.count({
      where: query
    }),
    prisma.article.findMany({
      // where: {
      //   ...query,
      //   categoryId: {
      //     in: childrenCategoryIds
      //   }
      // },
      where: query,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      ...QueryArticleListItmeData
    })
  ])

  

  return responFormat({
    total,
    list,
    current: page
  })
})