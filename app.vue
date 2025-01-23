<template>
  <NuxtLayout>
    <NuxtPage/>
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk?: string) => {
    return titleChunk ? `${titleChunk} -毛毛前端技术博客-mmisme` : '毛毛前端技术博客-mmisme';
  }
})
</script>
