<template>
  <div class="page-left">
    <ul>
      <li 
        v-for="article in data?.data.list" 
        :key="article.id" 
        class="article-item"
      >
        <NuxtLink :to="`/articles/${article.id}`">{{ article.title }}</NuxtLink>
      </li>
    </ul>
  </div>
  <div class="page-right">
    <hot-recommend/>
  </div>
</template>

<script setup>
import { getArticles } from '~/api/idnex'
let { data } = await useAsyncData(() => getArticles({categoryId: 2}))
</script>

<style lang="scss" scoped>
.page-left{
  background: #ffffff;
  border-radius: 4px;
  padding: 10px 10px;
  flex: 1;
  margin: 0 20px;
  box-shadow: 0 2px 8px #f2f3f5;
}
.page-right{
  width: 260px;
  flex-shrink: 0;
}
</style>