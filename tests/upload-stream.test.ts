import assert from 'node:assert/strict'
import test from 'node:test'
import { Readable } from 'node:stream'
import { buildUploadKey, validateUploadFilename } from '../server/utils/uploadValidate'

// 流式上传：内存占用应恒定在缓冲区，不随文件体积增长。
// 这里验证 OSS key 拼接、文件名校验、putStream 被以 stream 形式调用（mock client，不真连 OSS）。
// 注意不能用 multipartUpload：它内部对 file 调用 path.extname，传 stream 会抛 ERR_INVALID_ARG_TYPE，故流式必须用 putStream。

// 用依赖注入构造一个可测的 uploadStream，与 server/utils/oss.ts 中实现同构：
// 传入一个假 client，断言其被正确调用、key 正确、stream 原样透传。
function makeUploadStream (client: { putStream: (key: string, stream: NodeJS.ReadableStream) => Promise<{ url: string }> }) {
  return async function uploadStream ({ directory, filename, stream }: {
    directory: string
    filename: string
    stream: NodeJS.ReadableStream
  }) {
    const ossEnv = 'stage'
    if (!validateUploadFilename(filename)) return null
    try {
      const key = buildUploadKey(ossEnv, directory, filename)
      const result = await client.putStream(key, stream)
      return result.url
    } catch (error) {
      console.error(error)
      return null
    }
  }
}

test('uploadStream 用原始文件名拼接 key 并将 stream 透传给 putStream', async () => {
  const captured: { key: string; stream: NodeJS.ReadableStream }[] = []
  const client = {
    async putStream (key: string, stream: NodeJS.ReadableStream) {
      captured.push({ key, stream })
      return { url: key }
    },
  }
  const uploadStream = makeUploadStream(client)
  const source = Readable.from(['a', 'b', 'c'])

  const result = await uploadStream({ directory: 'electron_resource', filename: 'app-1.0.0.exe', stream: source })

  assert.equal(result, 'blog_data_stage/electron_resource/app-1.0.0.exe')
  assert.equal(captured.length, 1, 'putStream 应被调用一次')
  assert.equal(captured[0].key, 'blog_data_stage/electron_resource/app-1.0.0.exe')
  assert.equal(captured[0].stream, source, 'stream 应原样透传，不被缓冲为 Buffer')
})

test('uploadStream 对非法文件名拒绝上传并返回 null', async () => {
  let uploadCount = 0
  const client = {
    async putStream () {
      uploadCount++
      return { url: '' }
    },
  }
  const uploadStream = makeUploadStream(client)
  const result = await uploadStream({ directory: 'electron_resource', filename: '../evil.exe', stream: Readable.from([]) })

  assert.equal(result, null)
  assert.equal(uploadCount, 0, '非法文件名不应触发上传')
})
