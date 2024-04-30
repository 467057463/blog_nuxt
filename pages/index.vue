<template>
  <div>
    <div v-for="article in data?.data.list" :key="article.id">
      <div class="title">
        <NuxtLink :to="`/articles/${article.id}`">{{ article.title }}</NuxtLink>
      </div>
      <div class="content">{{ article.describe }}</div>
      <div class="meta">
        <span>{{ article.createdAt }}</span>
        <span>{{ article.author.username }} <img :src="article.author.profile.avatar"/></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getArticles } from '~/api/idnex'
const { data } = await useAsyncData('articles', () => getArticles())
</script>