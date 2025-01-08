// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    jwtSecert: '',
    public: {
      API_HOST: ''
    }
  },
  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in'
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
    '@element-plus/nuxt',
    '@prisma/nuxt',
    'nuxt-auth-utils',
  ],
})