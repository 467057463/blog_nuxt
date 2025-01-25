<template>
  <article-editer mode="edit" :articleId="route.params.id"/>
</template>

<script setup lang="ts">
const route = useRoute()
definePageMeta({
  layout: false,
  validate: async(route) => {
    return typeof route.params.id === 'string' && /^\d+$/.test(route.params.id)
  }
})
</script>