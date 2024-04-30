<template>
  <article-editer 
    :title="data?.data?.title"
    :content="data?.data?.raw"
    @save="handleSave"
  />
</template>

<script setup lang="ts">
import { getArticleById, updateArticle } from '~/api/idnex'
import type { CreateArticleParamsType } from '~/api/index'

const route = useRoute()
const articleId = route.params.id;
const { data } = await useAsyncData(articleId, () => getArticleById(route.params.id))

async function handleSave(params: CreateArticleParamsType){
  try {
    const res = await updateArticle(articleId, params)
    navigateTo(`/articles/${articleId}`)
  } catch (error) {
    
  }
}
</script>