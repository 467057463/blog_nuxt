// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    jwtSecert: process.env.NUXT_JWT_SECERT,
    ossEnv: process.env.NUXT_OSS_ENV,
    ossAccessKeyId: process.env.NUXT_OSS_ACCESS_KEY_ID,
    ossAccessKeySecret: process.env.NUXT_OSS_ACCESS_KEY_SECRET,
  },
  imports: {
    dirs: ['~/lib', 'constant/**']
  },
  css: [
    '~/assets/styles/index.scss',
    '~/assets/iconfont/iconfont.css'
  ],
  vite: {
    resolve: {
      alias: {
        '.prisma/client/index-browser': './node_modules/.prisma/client/index-browser.js',
      },
    },
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