<template>
  <header>
    <ul>
      <li><NuxtLink to="/">技术</NuxtLink></li>
      <li><NuxtLink to="/life">生活</NuxtLink></li>
    </ul>

    <div class="user-info">
      <NuxtLink v-if="!userInfo" to="/login">登录</NuxtLink>
      <template v-else>
        <NuxtLink to="/login">
          {{ userInfo?.username }} 
          <img :src="userInfo.profile.avatar"/>
        </NuxtLink>
        <ul>
          <li><NuxtLink to="/articles/create">添加文章</NuxtLink></li>
          <li><span @click="userStore.logout">退出登录</span></li>
        </ul>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore)
</script>