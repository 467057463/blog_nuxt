// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    apiSercret: 123,
    public: {
      // API_HOST: 'https://api-stage.mmisme.cn'
      API_HOST: 'http://localhost:7001'
    }
  },
  routeRules: {
    '/login': {
      ssr: false
    }
  },
  modules: [
    '@pinia/nuxt',
    '@element-plus/nuxt'
  ]
})
