import OSS from 'ali-oss';
import path from 'node:path'
import { randomUUID } from 'node:crypto';

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
  async put(file: File){
    const config = useRuntimeConfig();
    try {
      const result = await useClient().put(
        `blog_data_${config.ossEnv}/${randomUUID()}${path.extname(file.name)}`,
        Buffer.from(await file.arrayBuffer())
      )
      return result;
    } catch (error) {
      console.error(error)
      return null
    }
  }
}
