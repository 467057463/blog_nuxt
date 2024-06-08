<template>
  <article-editer 
    draftId=""
    :articleId="articleId"
    :title="data?.data?.title"
    :content="data?.data?.content"
    :categoryId="data?.data?.categoryId"
    :tags="data?.data?.tags || []"
    :describe="data?.data?.describe"
    :cover="data?.data?.cover"
    @save="handleSave"
  />
</template>

<script setup lang="ts">
import { getArticleById, updateArticle } from '~/api/idnex'
import type { CreateArticleParamsType } from '~/api/index'

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter();
const articleId = route.params.id;
const { data } = await useAsyncData(() => getArticleById(articleId))

async function handleSave(params: CreateArticleParamsType){
  try {
    const res = await updateArticle(articleId, params)
    navigateTo(`/articles/${articleId}`)
  } catch (error) {
    
  }
}
</script>