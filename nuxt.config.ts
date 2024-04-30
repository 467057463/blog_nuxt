// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // devtools: { enabled: true },
  runtimeConfig: {
    public: {
      API_HOST: process.env.NUXT_PUBLIC_API_HOST
    }
  },
  routeRules: {
    '/login': {
      ssr: false
    },
    '/articles/create': {
      ssr: false
    },
    '/articles/:id/edit': {
      ssr: false
    }
  },
  modules: [
    '@pinia/nuxt',
    '@element-plus/nuxt'
  ],
})
