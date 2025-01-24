<template>
  <header>
    <!-- logo -->
    <NuxtLink to="/">
      <div class="logo">
        <img src="~/assets/img/logo.png"/>
      </div>
    </NuxtLink>

    <!-- 菜单 -->
    <div class="menu" :class="{shown: shownMenu}">
      <div class="nav-item">
        <NuxtLink to="/" activeClass="active">
          <i class="fi fi-technology"></i>
          代码
        </NuxtLink>
      </div>
      <div class="nav-item">
        <NuxtLink to="/life" activeClass="active">
          <i class="fi fi-life"></i>
          随笔
        </NuxtLink>
      </div>
      <div class="nav-item">
        <NuxtLink to="/link" activeClass="active">
          <i class="fi fi-link"></i>
          友链
        </NuxtLink>
      </div>
      <div class="nav-item">
        <NuxtLink to="/about" activeClass="active">
          <i class="fi fi-about"></i>
          关于
        </NuxtLink>
      </div>

      <!-- 只在移动端显示 -->
      <template v-if="loggedIn">
        <div class="nav-item user-item">
          <NuxtLink to="/articles/create" activeClass="active">
            <i class="fi fi-about"></i>
            发布文章
          </NuxtLink>
        </div>
        <div class="nav-item  user-item">
          <NuxtLink to="/articles/darfts" activeClass="active">
            <i class="fi fi-about"></i>
            我的草稿
          </NuxtLink>
        </div>
        <div class="nav-item  user-item">
          <NuxtLink @click="clear" activeClass="active">
            <i class="fi fi-about"></i>
            退出登录
          </NuxtLink>
        </div>
      </template>
    </div>

    <div class="nav-right">
      <div class="nav-item" @click="handleToggle">
        <i class="fi" :class="isDark ? 'fi-sun' : 'fi-moon'"></i>
      </div>

      <div class="nav-item" @click="navigateTo('https://github.com/467057463', { external: true, open: {target:'_blank'} })">
        <i class="fi fi-github"></i>
      </div>

      <!-- 只在PC显示 -->
      <div class="nav-item user-icon" v-if="loggedIn">
        <el-dropdown>
          <i class="fi fi-user"></i>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <NuxtLink to="/articles/create">发布文章</NuxtLink>
              </el-dropdown-item>
              <el-dropdown-item>
                <NuxtLink to="/articles/darfts">我的草稿</NuxtLink>
              </el-dropdown-item>
              <el-dropdown-item>
                <span @click="clear">退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 移动端导航 -->
      <div class="nav-item mobile-menu-icon" @click="shownMenu = !shownMenu">
        <i class="fi fi-menu" v-if="!shownMenu"></i>
        <i class="fi fi-close" v-else></i>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// 亮暗模式
import { useDark, useToggle } from '@vueuse/core'
const isDark = useDark()
const toggleDark = useToggle(isDark)
function handleToggle(){
  toggleDark();
}


// 菜单显示隐藏
const shownMenu = ref(false);
const router = useRouter()
router.afterEach(() => {
  shownMenu.value = false
})

const { loggedIn, clear } = useUserSession()
</script>

<style lang="scss" scoped>
header{
  height: 60px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  z-index: 2;
  width: 100%;
  border-bottom: 1px solid getCssVar("border", "color", 'gray-1--gray-8');
  box-sizing: border-box;
  flex-shrink: 0;
  background: getCssVar('bg', 'color', 'gray-0--gray-10');

  // logo
  .logo{
    margin-right: 15px;
    cursor: pointer;
    z-index: 2;
    img{
      height: 28px;
    }
  }

  .menu{
    flex: 1;
    a {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: getCssVar("text", "color", 'normal');
      &:hover{
        color: getCssVar("text", "color", 'gray-9--gray-1');
      }
      &.active{
        color: getCssVar('color', 'brand');
      }
    }

    @media screen and (min-width: 900px) {
      display: flex;
      align-items: center;
      height: 100%;

      .nav-item{
        margin: 5px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        line-height: 1;
      }
      .user-item{
        display: none;
      }
      .fi{
        margin-right: 6px;
        display: none;
      }
    }

    @media screen and (max-width: 900px) {
      position: fixed;
      height: auto;
      display: none;
      top: 60px;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 2;
      flex-direction: column;
      background: getCssVar('bg', 'color', 'gray-0--gray-10');
      padding: 10px 32px;
      

      &.shown{
        display: flex;
      }

      .nav-item{
        a{
          height:50px;
          display: flex;
          align-items: center;
        }
      }
      .nav-item + .nav-item{
        border-top: 1px solid getCssVar("border", "color", 'gray-1--gray-8');
      }
      .fi{
        margin-right: 10px;
      }
    }
  }

  .nav-right{
    font-size: 18px;
    display: flex;

    .nav-item{
      height: 36px;
      width: 36px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      border-radius: 4px;
    
      .fi {
        font-size: 18px;
        color: getCssVar("text", "color", 'normal');
        &:hover{
          color: getCssVar("text", "color", 'gray-9--gray-1');
        }
      }

      .fi-close{
        font-size: 14px;
      }
      .fi-menu{
        font-size: 16px;
      }

      &:hover{
        background: getCssVar('bg', 'color', 'gray-1--gray-9');
      }
    }


    @media screen and (min-width: 900px) {
      .mobile-menu-icon{
        display: none;
      }
    }

    @media screen and (max-width: 900px) {
      .user-icon{
        display: none;
      }
    }
  }
}
</style>