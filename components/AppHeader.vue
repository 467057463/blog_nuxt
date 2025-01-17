<template>
  <header>
    <!-- logo -->
    <div class="logo">
      <img src="~/assets/img/logo.png"/>
    </div>

    <!-- 菜单 -->
    <div class="menu" :class="{shown: shownMenu}">
      <div :class="['nav', {'is-login': loggedIn}]">
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
          <div class="nav-item">
            <NuxtLink to="/articles/create" activeClass="active">
              <i class="fi fi-about"></i>
              发布文章
            </NuxtLink>
          </div>
          <div class="nav-item">
            <NuxtLink to="/articles/drafts" activeClass="active">
              <i class="fi fi-about"></i>
              我的草稿
            </NuxtLink>
          </div>
          <div class="nav-item">
            <NuxtLink @click="clear" activeClass="active">
              <i class="fi fi-about"></i>
              退出登录
            </NuxtLink>
          </div>
        </template>
      </div>

      <div class="nav-right">
        <div class="nav-item">
          <NuxtLink  @click="handleToggle">
            <i class="fi" :class="isDark ? 'fi-sun' : 'fi-moon'"></i>
          </NuxtLink>
        </div>

        <div class="nav-item">
          <NuxtLink to="https://github.com/467057463" target="_blank">
            <i class="fi fi-github"></i>
          </NuxtLink>
        </div>

        <!-- 只在PC显示 -->
        <div class="nav-item" v-if="loggedIn">
          <el-dropdown>
            <a>
              <i class="fi fi-user"></i>
            </a>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <NuxtLink to="/articles/create">发布文章</NuxtLink>
                </el-dropdown-item>
                <el-dropdown-item>
                  <NuxtLink to="/articles/drafts">我的草稿</NuxtLink>
                </el-dropdown-item>
                <el-dropdown-item>
                  <span @click="clear">退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
    
    <!-- 移动端导航 -->
    <div class="mobile-menu-icon" @click="shownMenu = !shownMenu">
      <i class="fi fi-menu" v-if="!shownMenu"></i>
      <i class="fi fi-close" v-else></i>
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
  position: relative;
  border-bottom: 1px solid getCssVar("border", "color", 'gray-1--gray-8');
  box-sizing: border-box;
  flex-shrink: 0;

  .logo{
    margin-right: 15px;
    cursor: pointer;
    z-index: 2;
    img{
      height: 30px;
    }
  }

  .mobile-menu-icon{
    display: none;
    cursor: pointer;
    color: getCssVar("text", "color", 'normal');
    width: 34px;
    height: 34px;
    justify-content: center;
    align-items: center;
    margin-right: -5px;
    .fi-close{
      font-size: 14px;
    }
    &:hover{
      color: getCssVar("text", "color", 'gray-9--gray-1');
      background: getCssVar('bg', 'color', 'gray-1--gray-9');
      border-radius: 4px;
    }
    @media screen and (max-width: 900px) {
      display: flex;
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
      height: 60px;
      display: flex;
      justify-content: flex-end;
      align-items: center;

      .nav{
        display: flex;
        align-items: center;
        height: 100%;
        flex: 1;
        font-size: 14px;

        .nav-item{
          margin: 5px;
          padding: 0 10px;
          display: flex;
          align-items: center;
          line-height: 1;
        }
        .fi{
          margin-right: 6px;
          display: none;
        }
        &.is-login{
          .nav-item:nth-last-child(-n+3){
            display: none;
          }
        }
      }
      
      .nav-right{
        font-size: 18px;
        display: flex;
        .nav-item{
          height: 30px;
          width: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        a{
          cursor: pointer;
        }
      }
    }

    @media screen and (max-width: 900px) {
      position: fixed;
      height: auto;
      display: none;
      top: 60px;
      bottom: 0;
      z-index: 2;
      flex-direction: column;
      background: getCssVar('bg', 'color', 'gray-0--gray-10');
      padding: 6px 24px;
      left: 0;
      right: 0;
      &.shown{
        display: flex;
      }

      .nav{
        flex: 1;
        .nav-item{
          a{
            height:40px;
            display: flex;
            align-items: center;
          }
          cursor: pointer;
          .fi{
            margin-right: 10px;
          }
        }
        .nav-item + .nav-item{
          border-top: 1px solid getCssVar("border", "color", 'gray-1--gray-8');
        }


      }
      .nav-right{
        display: flex;
        justify-content: center;

        .nav-item{
          border-top: none;
          a{
            display: flex;
            justify-content: center;
            align-items: center;
            width: 30px;
            height: 30px;
            cursor: pointer;
          }
          .fi{
            font-size: 16px;
          }
        }
        .nav-item:nth-last-child(1){
          display: none;
        }
      }
    }
  }
}
</style>