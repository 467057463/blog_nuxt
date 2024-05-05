<template>
  <NuxtLayout>
    <NuxtPage/>
  </NuxtLayout>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const appStore = useAppStore();

await Promise.all([
  useAsyncData('userinfo', () => userStore.fetchUserInfo()),
  useAsyncData('categories', () => appStore.fetchCategories()),
  useAsyncData('tags', () => appStore.fetchTags()),
])
</script>