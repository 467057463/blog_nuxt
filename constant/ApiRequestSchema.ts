
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