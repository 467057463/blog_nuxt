import busboy from 'busboy'
import { checkUploadKey, validateUploadFilename } from '../utils/uploadValidate'

// Electron 全量更新上传（流式版）：鉴权 -> 流式解析 multipart -> 校验文件名 -> 逐个流式上传 -> 成功返回空对象。
// 用 busboy 边解析边把文件 stream 直传 OSS 分片上传，避免 readMultipartFormData 将整个 body 读入内存（大文件触发 OOM）。
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // 1. 鉴权：header 密钥须匹配当前环境 NUXT_UPLOAD_SECRET（在读取 body 前判断，尽早拒绝）
  if (!checkUploadKey(getHeader(event, 'x-upload-key'), config.uploadSecret)) {
    setResponseStatus(event, 401)
    return responFormat(null, 100001, '鉴权失败')
  }

  // 2. 用 busboy 流式解析 multipart，对每个文件字段实时校验并流式上传
  const bb = busboy({ headers: event.node.req.headers })
  const tasks: Promise<boolean>[] = []
  // 记录是否有文件字段、是否出现非法文件名/上传失败，任一错误整体失败
  let hasFile = false
  let failed = false

  // 捕获 busboy 底层解析错误（如 multipart 格式异常），统一按 400 处理
  bb.on('error', (err) => {
    console.error('busboy 解析错误:', err)
    failed = true
  })

  bb.on('file', (name, stream, info) => {
    const filename = info.filename as string | undefined
    // 空文件名/非文件字段：忽略
    if (!filename) return
    hasFile = true

    // 3. 校验文件名，任一非法即整体失败
    if (!validateUploadFilename(filename)) {
      failed = true
      stream.resume() // 丢弃该文件流，避免 busboy 缓冲阻塞
      return
    }

    // 4. 流式上传：stream 直传 OSS 分片，内存不随文件增大
    tasks.push(
      oss.uploadStream({ directory: 'electron_resource', filename, stream }).then((url) => {
        if (!url) failed = true
        return !!url
      })
    )
  })

  // 5. 等待 multipart 解析与所有文件上传完成
  await new Promise<void>((resolve, reject) => {
    bb.on('close', resolve)
    bb.on('error', reject)
    event.node.req.pipe(bb)
  })

  if (failed) {
    setResponseStatus(event, 500)
    return responFormat(null, 100005, '文件上传失败')
  }
  if (!hasFile) {
    setResponseStatus(event, 400)
    return responFormat(null, 100002, '未接收到文件')
  }

  // 6. 等待所有分片上传完成（上述 close 只表示解析完，上传可能仍在进行）
  await Promise.all(tasks)

  if (failed) {
    setResponseStatus(event, 500)
    return responFormat(null, 100005, '文件上传失败')
  }

  // 7. 成功：空对象
  return responFormat({})
})
