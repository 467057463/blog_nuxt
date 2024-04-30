<template>
  <NuxtLayout>
    <NuxtPage/>
  </NuxtLayout>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const res = await useAsyncData('userinfo', () => userStore.fetchUserInfo())
</script>