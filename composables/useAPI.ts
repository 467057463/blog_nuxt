import type { UseFetchOptions } from "#app";
import type { FetchError } from 'ofetch'

export type RequestResult<T> = {
  data: T
  code: number
  msg: string
}

export function useAPI<T>(
  url: string,
  options?: UseFetchOptions<RequestResult<T>>
){
  return useFetch<RequestResult<T>, FetchError<RequestResult<any>>>(url, {
    ...options,
    $fetch: useNuxtApp().$api
  })
}