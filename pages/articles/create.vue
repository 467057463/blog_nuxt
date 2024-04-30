<template>
  <article-editer @save="handleSave"/>
</template>

<script setup lang="ts">
import { createArticle } from '~/api/idnex'
import type { CreateArticleParamsType } from '~/api/index'

async function handleSave(params: CreateArticleParamsType){
  try {
    const res = await createArticle(params)
    navigateTo(`/articles/${res.data.id}`)
  } catch (error) {
    
  }
}
</script>