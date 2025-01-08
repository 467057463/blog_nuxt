export function auth(fn){
  return async(event) => {
    const user = event.context.user;
    if(!user){
      setResponseStatus(event, 401)
      return {
        code: 100002,
        data: null,
        message: '登录超时，请重新登录'
      }
    }
    return await fn(event)
  }
}