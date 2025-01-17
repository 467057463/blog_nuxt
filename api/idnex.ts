import type { Category, Tag, Article } from '@prisma/client'
import type { LoginParamsType, CreateArticleType, QueryArticleType } from '~/constant/ApiRequestSchema'


export type CaptchaType = {
  uuid: string,
  captcha: string
}

export function getCaptcha(){
  return useAPI<CaptchaType>('/captcha')
}

// 登录
type LoginResultType = {
  token: string,
  userInfo: UserInfoType
}
export function fetchLogin(body: LoginParamsType){
  return useRequest<LoginResultType>('/login', {
    method: "POST",
    body
  })
}



export const getCategories = () => useAPI<Category[]>('/categories') 

export const getTags = () => useAPI<Tag[]>('/tags') 

// 添加文章
export function createArticle(body: FormData){
  return useRequest('/articles', {
    method: 'POST',
    body
  })
}

// 更新文章
export function updateArticle(id: number| string, body: FormData){
  return useRequest(`/articles/${id}`, {
    method: 'POST',
    body
  })
}

// 获取文章列表
export type ArticlesData = {
  count: number,
  currentPage: number,
  limit: number,
  list: Article[]
  pages: number  
}
export function getArticles(params?: Partial<QueryArticleType>){
  return useAPI<ArticlesData>('/articles', {
    params
  })
}

// 文章详情
export function getArticleById(id: number| string){
  return useAPI<Article>(`/articles/${id}`, {
    method: 'GET'
  })
}

// 草稿详情
export function getArticleDraftById(id: number| string){
  return useRequest<Article>(`/articles/${id}/darft`, {
    method: 'GET'
  })
}


// 删除文章
export function deleteArticle(id: number|string){
  return useRequest(`/articles/${id}`, {
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
