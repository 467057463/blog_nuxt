<template>
  <header>
    <div class="nav">
      <div class="brand">
        <img src="~/assets/img/logo.png"/>
      </div>
      <div class="nav-item">
        <NuxtLink to="/" activeClass="active">
          <!-- <i class="font-icon fi-technology"></i> -->
          代码
        </NuxtLink>
      </div>
      <div class="nav-item">
        <NuxtLink to="/life" activeClass="active">
          <!-- <i class="font-icon fi-life"></i> -->
          随笔
        </NuxtLink>
      </div>
      <div class="nav-item">
        <NuxtLink to="/life" activeClass="active">
          <!-- <i class="font-icon fi-life"></i> -->
          友链
        </NuxtLink>
      </div>
      <div class="nav-item">
        <NuxtLink to="/life" activeClass="active">
          <!-- <i class="font-icon fi-life"></i> -->
          关于
        </NuxtLink>
      </div>
    </div>

    <div class="nav-right">
      <div class="action-wrapper" @click="handleToggle">
        <i class="font-icon" :class="isDark ? 'fi-sun' : 'fi-moon'"></i>
      </div>

      <div class="action-wrapper">
        <i class="font-icon fi-github"></i>
      </div>
    
      <el-dropdown v-if="userInfo">
        <div class="user-info">
          <el-avatar :src="userInfo.profile.avatar" class="avatar" :size="30"/>
          {{ userInfo?.username }} 
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <NuxtLink to="/drafts/create">添加文章</NuxtLink>
            </el-dropdown-item>
            <el-dropdown-item>
              <NuxtLink to="/drafts">我的草稿</NuxtLink>
            </el-dropdown-item>
            <el-dropdown-item>
              <span @click="userStore.logout">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useDark, useToggle, usePreferredDark } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
function handleToggle(){
  toggleDark();
}

const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);
</script>

<style lang="scss" scoped>
header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 24px;
  font-size: 14px;

  .nav{
    display: flex;
    list-style: none;
    align-items: center;
    padding: 0;
    margin: 0;
    height: 100%;

    .brand{
      margin-right: 15px;
      img{
        height: 30px;
      }
    }

    .nav-item{
      margin: 5px;
      padding: 0 5px;
    }

    a{
      position: relative;
      height: 100%;
      display: flex;
      align-items: center;
      text-decoration: none;
      color: getCssVar("text", '-gray-7--gray-2');
      .font-icon{
        margin-right: 5px;
      }
      &:hover{
        color: getCssVar("text", '-gray-9--gray-1');
      }
      &.active{
        color: getCssVar('color', 'brand');
      }
    }
  }
  
  .nav-right{
    display: flex;
    .action-wrapper{
      height: 30px;
      width: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      font-size: 18px;
      color: getCssVar("text", '-gray-7--gray-2');
      &:hover{
        color: getCssVar("text", '-gray-9--gray-1');
      }
    }
  }

  .user-info{
    display: flex;
    align-items: center;
    .avatar{
      margin-right: 6px;
    }
  }
}
</style>