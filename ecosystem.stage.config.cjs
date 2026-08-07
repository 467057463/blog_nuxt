module.exports = {
  apps: [
    {
      name: 'blog_nuxt-stage',
      // 服务器 VPN 差、无法 npm install，故不用 dotenv 包，改用 Node 22 内置 --env-file
      // 在进程启动时加载 release 根 .env，注入 DATABASE_URL、NUXT_SESSION_PASSWORD 等运行时变量。
      script: './.output/server/index.mjs',
      // 固定工作目录到 release 根，保证 .env 相对路径与脚本可解析（pm2 调用目录不可靠）。
      cwd: __dirname,
      node_args: '--env-file=.env',
      exec_mode: 'cluster',
      instances: 'max',
      // pm2 的 port 字段只是元数据，不会写入进程环境；监听端口需经 env.PORT 显式注入。
      env: {
        PORT: '3001',
      },
    }
  ]
}