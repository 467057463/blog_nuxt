
import { z } from 'zod'

export const loginParamsSchem = z.object({
  username: z.string({
    required_error: '用户名不能为空',
  }),
  password: z.string({
    required_error: '密码不能为空'
  }).min(8, {
    message: '请输入正确的密码'
  }),
  code: z.string({
    required_error: '验证码不能为空'
  }).length(4, {
    message: '请输入正确的验证码'
  }),
  uuid: z.string({
    required_error: 'uuid不能为空'
  })
})

export type LoginParamsType = z.infer<typeof loginParamsSchem>

export const createArticleSchem = z.object({
  title: z.string({
    required_error: '文章标题不能为空',
  }).trim(),
  content: z.string({
    required_error: '文章内容不能为空',
  }).trim(),
  describe: z.string().optional(),
  categoryId: z.number().optional(),
  tags: z.array(z.number()).optional(),
  status: z.enum(['DARFT', 'OFFICIAL']).optional().default("OFFICIAL"),
})

export type CreateArticleType = z.infer<typeof createArticleSchem>

export const queryArticleSchema = z.object({
  categoryId: z.union([z.number(), z.string()]).optional().transform((val) => val ? Number(val) : undefined),
  status: z.enum(['DARFT', 'OFFICIAL']).optional().default("OFFICIAL"),
  limit: z.number().optional().default(10),
  page: z.number().optional().default(1)
})

export type QueryArticleType = z.infer<typeof queryArticleSchema>
