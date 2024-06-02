<template>
  <NuxtLayout>
    <NuxtPage/>
  </NuxtLayout>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const appStore = useAppStore();

useSeoMeta({
  title: '毛毛前端技术博客-mmisme',
  // ogTitle: '我的神奇网站',
  // description: '这是我的神奇网站，让我来告诉你关于它的一切。',
  // ogDescription: '这是我的神奇网站，让我来告诉你关于它的一切。',
  // ogImage: 'https://example.com/image.png',
  // twitterCard: 'summary_large_image',
})

await Promise.all([
  useAsyncData('userinfo', () => userStore.fetchUserInfo()),
  useAsyncData('categories', () => appStore.fetchCategories()),
  useAsyncData('tags', () => appStore.fetchTags()),
])
</script>