export type RequestResult<T = any> = {
  data: T
  code: number
  message: string
}

const request = $fetch.create({
  credentials: "include",
  // 请求拦截
  onRequest({options}){
    console.log(options)
    // 添加baseURL,nuxt3环境变量要从useRuntimeConfig里面取
    const config = useRuntimeConfig()
    options.baseURL = config.public.API_HOST

    // 带上 token
    const token = useCookie('token');
    if(token.value){
      options.headers = new Headers(options.headers)
      options.headers.set('Authorization', `Bearer ${token.value}`)
    }
  },

  onResponse({request, response, options}){
    console.log({request, response, options})
    const data = response._data.data
    if(response._data.code !== 0){
      return Promise.reject(response)
    } else {
      response._data = data;
    }
  }
})

export default request;

// export const useRequest = {
//   request
// }


