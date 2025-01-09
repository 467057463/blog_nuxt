module.exports = {
  apps: [
    {
      name: 'blog_nuxt-stage',
      port: '3001',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
      env: {
        DATABASE_URL: "mysql://root:Nandudu_0914@127.0.0.1:3306/blog-state_1"
      }
    }
  ]
}