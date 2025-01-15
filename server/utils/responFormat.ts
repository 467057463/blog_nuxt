export function responFormat(res: any = null, code = 0, msg = '请求成功'){
  return {
    code,
    data: res,
    msg
  }
}