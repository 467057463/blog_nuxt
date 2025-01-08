// 获取分类列表
export type CategoryType = {
  id: number,
  order: number,
  label: string,
  name: string,
}
export const getCategories = () => useAPI<CategoryType[]>('/categoriess') 


// 获取标签列表
export type TagType = {
  id: number,
  name: string,
}
export const getTags = () => useAPI<TagType[]>('/tags') 

// 获取文章列表
type GetArticlesParams = {
  page?: number,
  limit?: number
}
export type ArticlesData = {
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
  return useAPI<ArticlesData>('/articles', {
    params
  })
}

export type CaptchaType = {
  uuid: string,
  captcha: string
}

export function getCaptcha(){
  return useAPI<CaptchaType>('/captcha')
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
  return useAPI<RequestResult<LoginResultType>>('/login', {
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
  return useAPI<RequestResult<UserInfoType>>('/getuser_info', {
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
  return useAPI('/articles', {
    method: 'POST',
    body
  })
}

// 文章详情
export function getArticleById(id: number){
  return useAPI(`/articles/${id}`, {
    method: 'GET'
  })
}

// 更新文章
export function updateArticle(id: number, body: CreateArticleParamsType){
  return useAPI(`/articles/${id}`, {
    method:"POST",
    body
  })
}

// 删除文章
export function deleteArticle(id: number){
  return useAPI(`/articles/${id}`, {
    method: "DELETE",
  })
}

export function getDraftList(){
  return useAPI('/drafts')
}

export type CreateDraftParamsType = Pick<CreateArticleParamsType, 'title' | 'content' >
// 新建草稿
export function createDraft(params: CreateDraftParamsType & {articleId?: number}){
  return useAPI('/drafts', {
    body: params,
    method: "POST"
  })
}

// 更新草稿
export type UpdateDraftParamsType = CreateDraftParamsType & {articleId?: number}
export function updateDraft(id:number, params: UpdateDraftParamsType){
  return useAPI(`/drafts/${id}`, {
    body: params,
    method: "POST"
  })
}

// 草稿详情
export function getDraftById(id: number){
  return useAPI(`/drafts/${id}`)
}

// 删除文章
export function destroyDraft(id: number){
  return useAPI(`/drafts/${id}`, {
    method: 'delete'
  })
}

// 热门推荐
export function getHotArtices(){
  return useAPI('/articles/hots')
}