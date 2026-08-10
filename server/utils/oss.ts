import OSS from 'ali-oss';
import path from 'node:path'
import { randomUUID } from 'node:crypto';
import { buildUploadKey } from './uploadValidate'

let client: OSS;
const useClient = () => {
  if(client){
    return client
  }
  const config = useRuntimeConfig();
  return client = new OSS({
    // 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
    accessKeyId: config.ossAccessKeyId,
    accessKeySecret: config.ossAccessKeySecret,
    // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
    region: 'oss-cn-wuhan-lr',
    // @ts-ignore
    authorizationV4: true,
    // yourBucketName填写Bucket名称。
    bucket: 'mmismeblog',
    timeout: '60s',
    endpoint: 'https://oss-cn-wuhan-lr.aliyuncs.com'
  });
}

export const oss = {
  async put({ filename, data }: {filename: string, data: Buffer} = { filename: '', data: Buffer.from('')}){
    const config = useRuntimeConfig();
    try {
      const result = await useClient().put(
        `blog_data_${config.ossEnv}/${randomUUID()}${path.extname(filename)}`,
        data
      )
      return result;
    } catch (error) {
      console.error(error)
      return null
    }
  },
  // 供 Electron 更新上传复用同一 OSS client。directory 由路由层固定传入，key 保留原始文件名。
  async upload ({ directory, filename, data }: { directory: string, filename: string, data: Buffer }){
    const config = useRuntimeConfig();
    try {
      const key = buildUploadKey(config.ossEnv, directory, filename);
      const result = await useClient().put(key, data)
      return result.url as string
    } catch (error) {
      console.error(error)
      return null
    }
  },
  // 流式上传：数据以 stream 传入，分片上传，内存占用恒定在缓冲区、不随文件体积增长。
  // 用于 Electron 大文件（100MB+）上传，避免 readMultipartFormData 整块读内存触发 OOM。
  async uploadStream ({ directory, filename, stream }: { directory: string, filename: string, stream: NodeJS.ReadableStream }){
    const config = useRuntimeConfig();
    try {
      // useRuntimeConfig() 返回 unknown，此处显式断言为 string（buildUploadKey 需 string）
      const key = buildUploadKey(config.ossEnv as string, directory, filename);
      // multipartUpload 接受 stream 并自动分片，partSize 5MB 平衡内存与请求次数。
      await useClient().multipartUpload(key, stream, { partSize: 5 * 1024 * 1024 })
      return key
    } catch (error) {
      console.error(error)
      return null
    }
  }
}
