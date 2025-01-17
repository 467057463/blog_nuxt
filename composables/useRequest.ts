import type { RequestResult } from './useAPI';
import type { FetchOptions, FetchError } from 'ofetch';
import { ElMessage } from 'element-plus'

export function useRequest<T>(
  url: string,
  options: FetchOptions
){
  return useNuxtApp().$api<RequestResult<T>>(url, {
    ...options as any
  }).then(res => {
    if(res.code !== 0){
      ElMessage({
        type: "error",
        message: res.msg
      })
      return Promise.reject(res)
    }
    return res.data;
  }).catch(error => {
    console.error(error)
    if(error.status === 400 && error?.data?.data?.issues?.length){
      ElMessage({
        type: "error",
        message: error.data.data.issues[0].message
      })
    }
    return Promise.reject(error)
  })
}