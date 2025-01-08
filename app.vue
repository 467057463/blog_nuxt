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

<style lang="scss">
.page-enter-active,
.page-leave-active {
  transition: all 0.1s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}
</style>