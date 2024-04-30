module.exports = {
  apps: [
    {
      name: 'blog_nuxt-stage',
      port: '3000',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs'
    }
  ]
}