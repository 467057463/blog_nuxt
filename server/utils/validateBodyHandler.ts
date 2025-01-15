import type { EventHandler, EventHandlerRequest } from 'h3'

// export const validateBodyHandler = ((handler) => {
//   return defineEventHandler(async event => {
//     try {
//       const response = await handler(event)
//       return { response }
//     } catch (error) {
//       return { error }
//     }
//   })
// })


export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D> (
  handler: EventHandler<T, D>
): EventHandler<T, D> =>
  defineEventHandler<T>(async event => {
    try {
      // 在路由处理程序之前执行一些操作
      const response = await handler(event)
      // 在路由处理程序之后执行一些操作
      return { response }
    } catch (err) {
      // 错误处理
      return { err }
    }
  })