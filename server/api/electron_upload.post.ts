import { checkUploadKey, validateUploadFilename } from '../utils/uploadValidate'

// Electron 全量更新上传：鉴权 -> 取文件 -> 校验文件名 -> 逐个上传 -> 成功返回空对象。
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // 1. 鉴权：header 密钥须匹配当前环境 NUXT_UPLOAD_SECRET
  if (!checkUploadKey(getHeader(event, 'x-upload-key'), config.uploadSecret)) {
    setResponseStatus(event, 401)
    return responFormat(null, 100001, '鉴权失败')
  }

  // 2. 解析 multipart，仅取带 filename 的文件字段
  const multi = await readMultipartFormData(event)
  const files = multi?.filter(item => item.filename) ?? []
  if (files.length === 0) {
    setResponseStatus(event, 400)
    return responFormat(null, 100002, '未接收到文件')
  }

  // 3. 逐个校验文件名，任一非法即整体失败
  for (const file of files) {
    if (!validateUploadFilename(file.filename!)) {
      setResponseStatus(event, 400)
      return responFormat(null, 100004, '非法文件名')
    }
  }

  // 4. 逐个上传，任一失败即整体返回错误（避免更新链缺文件）
  for (const file of files) {
    const url = await oss.upload({
      directory: 'electron_resource',
      filename: file.filename!,
      data: file.data,
    })
    if (!url) {
      setResponseStatus(event, 500)
      return responFormat(null, 100005, '文件上传失败')
    }
  }

  // 5. 成功：空对象
  return responFormat({})
})