export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const { session } = useUserSession()

  const api = $fetch.create({
    baseURL: '/api',
    credentials: 'include',
    onRequest({request, options, error}){
      if (session.value?.token) {
        options.headers.set('Authorization', `Bearer ${session.value?.token}`)
      }
    },

    async onResponseError({response}){
      if(response.status === 401){
        await nuxtApp.runWithContext(() => navigateTo('/login'))
      }
    }
  })
  return {
    provide: {
      api
    }
  }
})