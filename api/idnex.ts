// 获取文章列表
type GetArticlesParams = {
  page?: number,
  limit?: number
}
type ArticlesData = Array<{
  title: string,
  content: string,
}>

export function getArticles(params: GetArticlesParams){
  return useRequest<RequestResult<ArticlesData>>('/articles', {
    params
  })
}

// 登录
