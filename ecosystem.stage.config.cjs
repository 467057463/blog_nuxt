module.exports = {
  apps: [
    {
      name: 'blog_nuxt-stage',
      port: '3001',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
      env: {
        DATABASE_URL: "mysql://root:nandudu_@localhost:3306/blog-state_1"
      }
    }
  ]
}