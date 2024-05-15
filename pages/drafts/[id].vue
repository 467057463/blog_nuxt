<template>
  <article-editer 
    :draftId="draftId"
    :articleId="data?.data?.articleId"
    :title="data?.data?.title"
    :content="data?.data?.content"
    :categoryId="data?.data?.article?.categoryId"
    :tags="data?.data?.article?.tags || []"
    :describe="data?.data?.article?.describe"
    :cover="data?.data?.article?.cover"
    @save="handleSave"
  />
</template>

<script setup lang="ts">
import { getDraftById, updateArticle } from '~/api/idnex'
import type { CreateArticleParamsType } from '~/api/index'

definePageMeta({
  layout: false
})

const route = useRoute()
const draftId = route.params.id;
const { data } = await useAsyncData(() => getDraftById(draftId))

async function handleSave(params: CreateArticleParamsType){
  try {
    const res = await updateArticle(articleId, params)
    navigateTo(`/articles/${articleId}`)
  } catch (error) {
    
  }
}
</script>