<template>
  <div class="">
    <div 
      v-for="article in data?.data.list" 
      :key="article.id" 
      class="article-item"
    >
      <div class="content-container">
        <div class="title">
          <NuxtLink :to="`/articles/${article.id}`">{{ article.title }}</NuxtLink>
        </div>
        <div class="content">
          <NuxtLink :to="`/articles/${article.id}`">{{ article.describe }}</NuxtLink>
        </div>
        <div class="meta">
          <div class="user-info">
            <span>作者：{{ article.author.username }} </span>
            <span>发布于：{{ article.createdAt }}</span>
          </div>
        </div>
      </div>
      <el-image :src="article.cover" v-if="article.cover" fit="cover"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getArticles } from '@/api/idnex'
const { data } = getArticles({
  categoryId: 2
});
</script>