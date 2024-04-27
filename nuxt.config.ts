// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    apiSercret: 123,
    public: {
      api: 'test'
    }
  },
  modules: [
    '@pinia/nuxt',
    '@element-plus/nuxt'
  ]
})
