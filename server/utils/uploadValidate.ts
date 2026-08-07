// Electron 更新文件名校验与 OSS key 拼接。抽成纯函数以便单测，路由层只做调用。
export function validateUploadFilename (filename: string): boolean {
  if (!filename) return false
  // 拒绝路径穿越与分隔符，防止目录注入
  if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) return false
  // 仅允许常见文件名字符（字母/数字/点/下划线/中划线）
  return /^[A-Za-z0-9._-]+$/.test(filename)
}

export function buildUploadKey (ossEnv: string, directory: string, filename: string): string {
  // 环境前缀隔离 stage/production，固定目录承载更新包，保留原始文件名
  return `blog_data_${ossEnv}/${directory}/${filename}`
}

export function checkUploadKey (key: string | undefined, secret: string | undefined): boolean {
  // 密钥必须已配置且完全一致，避免空值误放行
  return !!secret && !!key && key === secret
}
