module.exports = {
  apps: [
    {
      name: 'blog_nuxt_stage',
      port: '3001',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs'
    }
  ]
}