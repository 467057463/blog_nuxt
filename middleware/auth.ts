export default defineNuxtRouteMiddleware((to, from) => {
  if ( useUserSession().loggedIn.value === false) {
    return navigateTo('/login')
  }
})