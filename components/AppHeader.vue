<template>
  <header>
    <ul>
      <li><NuxtLink to="/">技术</NuxtLink></li>
      <li><NuxtLink to="/life">生活</NuxtLink></li>
    </ul>

    <div class="user-info">
      <NuxtLink v-if="!user.userInfo" to="/login">登录</NuxtLink>
      <NuxtLink v-else to="/life">{{ user.userInfo.name }}</NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
const user = useUserStore();
console.log(user.userInfo)
console.log(user.userInfo)
</script>