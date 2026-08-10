module.exports = {
  apps: [
    {
      name: 'blog_nuxt-stage',
      // 服务器 VPN 差、无法 npm install，故不用 dotenv 包，改用 Node 22 内置 --env-file
      // 在进程启动时加载 release 根 .env，注入 DATABASE_URL、NUXT_SESSION_PASSWORD 等运行时变量。
      script: './.output/server/index.mjs',
      // 固定工作目录到 release 根，保证脚本相对路径可解析（pm2 调用目录不可靠）。
      cwd: __dirname,
      // 用绝对路径加载 .env：pm2 启动的 node 进程 cwd 不可靠，相对路径会找不到 .env。
      node_args: `--env-file=${__dirname}/.env`,
      exec_mode: 'cluster',
      // 服务器内存仅 1.7GB，instances:'max' 起满实例会叠加内存触发 OOM（Electron 上传 102MB 时崩），
      // 固定为单实例，保留内存余量避免内核强杀进程。
      instances: 1,
      // pm2 的 port 字段只是元数据，不会写入进程环境；监听端口需经 env.PORT 显式注入。
      env: {
        PORT: '3001',
      },
    }
  ]
}