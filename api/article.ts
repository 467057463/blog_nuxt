import { Prisma, type Article, type Category, type Tag } from '@prisma/client'
import { z } from 'zod'

// ## 分类列表
export const getCategories = () => useAPI<Category[]>('/categories') 


// ## 标签列表
export const getTags = () => useAPI<Tag[]>('/tags') 


// ##  文章列表

// 请求参数
export const queryArticleListSchema = z.object({
  categoryId: z.union([z.number(), z.string()]).optional().transform((val) => val ? Number(val) : undefined),
  status: z.enum(['DARFT', 'OFFICIAL']).optional().default("OFFICIAL"),
  limit: z.number().optional().default(10),
  page: z.number().optional().default(1)
})

// 请求参数类型
export type QueryArticleListParamsType = z.infer<typeof queryArticleListSchema>

// Prisma 结构数据
export const QueryArticleListItmeData = Prisma.validator<Prisma.ArticleDefaultArgs>()({
  omit:{
    authorId: true,
    updatedAt: true,
    categoryId: true
  },
  include: {
    author: {
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      },
      include: {
        profile: {
          omit: {
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    },
    tags: true,
    category: true,
    parent: {
      select: {
        id: true
      }
    }
  }
})

// 返回类型
export type QueryArticleResultType = {
  total: number,
  current: number,
  list: Prisma.ArticleGetPayload<typeof QueryArticleListItmeData>[]
}

// 请求 API
export function getArticles(params?: Partial<QueryArticleListParamsType>){
  return useAPI<QueryArticleResultType>('/articles', {
    params
  })
}


// ## 文章详情

// 返回类型
export type ArticleDetailType = Prisma.ArticleGetPayload<typeof QueryArticleListItmeData>

// 请求 API
export function getArticleById(id: number){
  return useAPI<ArticleDetailType>(`/articles/${id}`, {
    method: 'GET'
  })
}


// ## 草稿详情

// Prisma 结构数据
export const DarftData = Prisma.validator<Prisma.ArticleDefaultArgs>()({
  omit: {
    createdAt: true,
    updatedAt: true
  },
  include: {
    tags: true,
    parent: {
      select: {
        id: true
      }
    },
    darft: {
      omit: {
        createdAt: true,
        updatedAt: true
      },
      include: {
        tags: true,
      }
    }
  }
})

export type DarftResultType = Omit<Prisma.ArticleGetPayload<typeof DarftData>, "id" | "darft" | "tags"> & {
  parentId?: number | null,
  tagIds: number[]
}

// 请求 API
export function getArticleDraftById(id: number){
  return useRequest<DarftResultType>(`/articles/${id}/darft`, {
    method: 'GET'
  })
}


// ## 新建/编辑 文章/草稿

// 请求参数
export const createArticleSchema = z.object(({
  title: z.string({
    required_error: '文章标题不能为空',
  }).trim(),
  content: z.string({
    required_error: '文章内容不能为空',
  }).trim(),
  categoryId: z.string().transform(val => val ? Number(val) : undefined).optional(),
  tagIds: z.string().transform((val) => val.split(",").map(i => ({id: Number(i)}))).optional(),
  cover: z.any(),
  describe: z.string().optional(),
  darftId: z.string().transform(val => val ? Number(val) : undefined).optional(),
  parentId: z.string().transform(val => val ? Number(val) : undefined).optional(),
  status: z.enum(['DARFT', 'OFFICIAL']).optional().default("OFFICIAL"),
}))

// 请求参数类型
export type CreateArticleType = z.infer<typeof createArticleSchema>;

// 请求 API
export function createArticle(body: FormData){
  return useRequest<Article>('/articles', {
    method: 'POST',
    body
  })
}


// ## 删除文章
export function deleteArticle(id: number){
  return useRequest<Article>(`/articles/${id}`, {
    method: "DELETE",
  })
}
