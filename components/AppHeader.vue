<template>
  <header>
    <ul class="nav">
      <li class="brand">
        <NuxtLink to="/">
          <img src="~/assets/img/logo.png"/>
        </NuxtLink>
      </li>
      <!-- <li v-for="item in categories">
        <NuxtLink :to="`/${item.name}`">{{ item.name }}</NuxtLink>
      </li> -->
      <li><NuxtLink to="/" activeClass="active">技术</NuxtLink></li>
      <li><NuxtLink to="/life" activeClass="active">生活</NuxtLink></li>
    </ul>

    <NuxtLink 
      v-if="!userInfo" 
      to="/login" 
      class="login-btn"
    >登录</NuxtLink>
    <el-dropdown v-else>
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
  </header>
</template>

<script setup lang="ts">
const userStore = useUserStore();
// const appStore = useAppStore();

const { userInfo } = storeToRefs(userStore);
// const { categories, tags } = storeToRefs(appStore);
</script>

<style lang="scss" scoped>
header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 48px;
  padding: 0 24px;
  background: #ffffff;
  box-shadow: 0 2px 8px #f2f3f5;
  color: #515767;
  font-size: 14px;
  a {
    color: #515767;
    text-decoration: none;
  }
  ul.nav{
    display: flex;
    list-style: none;
    align-items: center;
    padding: 0;
    margin: 0;
    height: 100%;
    li:not(.brand){
      height: 100%;
    }
    a{
      position: relative;
      height: 100%;
      display: flex;
      list-style: none;
      align-items: center;
    }
    li + li {
      margin: 5px;
      padding: 0 5px;
    }
    .active{
      color: #1e80ff;
      font-weight: bold;
      // &::after{
      //   content: "";
      //   position: absolute;
      //   bottom: 0px;
      //   height: 2px;
      //   left: 0;
      //   right: 0;
      //   background: #458ef6;
      // }
    }
  }
  li.brand{
    margin-right: 15px;
    img{
      height: 30px;
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