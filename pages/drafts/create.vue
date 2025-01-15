<template>
  <article-editer
    draftId=""
    :articleId="null"
    title=""
    content=""
    categoryId=""
    :tags="[]"
    describe=""
    cover=""
    @save="handleSave"
  />
</template>

<script setup lang="ts">
import { createArticle } from '~/api/idnex'
import type { CreateArticleParamsType } from '~/api/index'

definePageMeta({
  layout: false,
  middleware: ['auth']
})

async function handleSave(params: CreateArticleParamsType){
  try {
    const res = await createArticle(params)
    navigateTo(`/articles/${res.data.id}`)
  } catch (error) {
    
  }
}
</script>