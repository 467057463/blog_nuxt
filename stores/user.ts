import { fetchLogin, getUserInfo } from '~/api/idnex'
import type { FetchLoginParams, UserInfoType } from '~/api/idnex'


export const useUserStore = defineStore('user', () => {
  let token = useCookie('token', {
    maxAge: 60 * 60 * 24 * 30
  });
  let userInfo = ref<UserInfoType | null>(null)

  // 登录方法
  async function login(params: FetchLoginParams){
    try {
      const res = await fetchLogin(params);
      token.value = res.data.token;
      userInfo.value = res.data.userInfo;
    } catch (error) {
      console.error(error)
    }
  }

  // 获取用户信息
  async function fetchUserInfo(){
    if(token.value){
      try {
        const res = await getUserInfo()
        console.log('res', res)
        userInfo.value = res.data;
        return res.data;
      } catch (error) {
        userInfo.value = null;
        token.value = null
      }
    }
    return null;
  }

  // 退出登录
  async function logout(){
    token.value = null;
    userInfo.value = null;
    navigateTo('/')
  }

  return {
    userInfo,
    token,
    login,
    fetchUserInfo,
    logout
  }
})