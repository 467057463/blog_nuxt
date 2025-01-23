import { z } from 'zod'

//## 获取验证码

// 返回类型
export type CaptchaType = {
  uuid: string,
  captcha: string
}

// API 方法
export function getCaptcha(){
  return useAPI<CaptchaType>('/captcha')
}


//## 登录

// 请求参数
export const loginParamsSchema = z.object({
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

// 请求参数类型
export type LoginParamsType = z.infer<typeof loginParamsSchema>

// 返回类型
export type LoginResultType = {
  token: string
}

// API 方法
export function fetchLogin(body: LoginParamsType){
  return useRequest<LoginResultType>('/login', {
    method: "POST",
    body
  })
}