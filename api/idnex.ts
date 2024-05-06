// 获取分类列表
export type CategoryData = {
  id: number,
  order: number,
  label: string,
  name: string,
}
export function getCategories(){
  return useRequest<RequestResult<CategoryData[]>>('/categories')
}

// 获取标签列表
export type TagData = {
  id: number,
  name: string,
}
export function getTags(){
  return useRequest<RequestResult<TagData[]>>('/tags')
}

// 获取文章列表
type GetArticlesParams = {
  page?: number,
  limit?: number
}
type ArticlesData = {
  count: number,
  currentPage: number,
  limit: number,
  list: Array<{
    author: UserInfoType,
    id: number,
    title: string,
    content: string,
    cover: string,
    describe: string,
    createdAt: string,
    tags: Array<{
      id: number,
      name: string
    }>,
  }>
  pages: number  
}
export function getArticles(params?: GetArticlesParams){
  return useRequest<RequestResult<ArticlesData>>('/articles', {
    params
  })
}


// 登录
export type FetchLoginParams = {
  username: string,
  password: string
}
type LoginResultType = {
  token: string,
  userInfo: UserInfoType
}
export function fetchLogin(body: FetchLoginParams){
  return useRequest<RequestResult<LoginResultType>>('/login', {
    method: "POST",
    body
  })
}

// 根据 token 获取用户信息
export type UserInfoType = {
  id: number,
  username: string,
  profile: {
    id: number,
    name: string,
    avatar: string,
    email: string,
    intro: string,
    site: string,
    github: string,
    phone: string,
    qq: string
  }
}
export function getUserInfo(){
  return useRequest<RequestResult<UserInfoType>>('/getuser_info', {
    method: "POST"
  })
}

export type CreateArticleParamsType = {
  title: string,
  content: string,
  raw: string,
  describe: string,
  categoryId: number,
  tags: string[]
}

// 添加文章
export function createArticle(body: CreateArticleParamsType){
  return useRequest('/articles', {
    method: 'POST',
    body
  })
}

// 文章详情
export function getArticleById(id: number){
  return useRequest(`/articles/${id}`, {
    method: 'GET'
  })
}

// 更新文章
export function updateArticle(id: number, body: CreateArticleParamsType){
  return useRequest(`/articles/${id}`, {
    method:"POST",
    body
  })
}

// 删除文章
export function deleteArticle(id: number){
  return useRequest(`/articles/${id}`, {
    method: "DELETE",
  })
}
