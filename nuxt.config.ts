// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    jwtSecert: process.env.NUXT_JWT_SECERT,
    ossEnv: process.env.NUXT_OSS_ENV,
    ossAccessKeyId: process.env.NUXT_OSS_ACCESS_KEY_ID,
    ossAccessKeySecret: process.env.NUXT_OSS_ACCESS_KEY_SECRET,
    uploadSecret: process.env.NUXT_UPLOAD_SECRET,
  },
  imports: {
    dirs: ['constant', 'api']
  },
  nitro: {
    imports: {
      dirs: ['lib', 'constant', 'api']
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
  // @prisma/nuxt 0.3.0 尚未支持 Prisma 7 强制 adapter，保留依赖但暂不加载运行时模块。
  modules: [
    '@pinia/nuxt',
    '@element-plus/nuxt',
    'nuxt-auth-utils',
    "@nuxt/icon"
  ],
})