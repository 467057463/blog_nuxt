// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      API_HOST: process.env.NUXT_PUBLIC_API_HOST
    }
  },
  css: [
    '~/assets/styles/index.scss',
    '~/assets/iconfont/iconfont.css'
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/assets/styles/common/_mixin.scss" as *;
          `,
        },
      },
    },
  },
  routeRules: {
    '/login': {
      ssr: false
    },
    '/drafts/create': {
      ssr: false
    },
    '/drafts/:id': {
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
