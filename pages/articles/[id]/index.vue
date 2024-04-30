<template>
  <div>
    <NuxtLink :to="`/articles/${$route.params.id}/edit`">编辑</NuxtLink>
    <span @click="handleDelete">删除</span>

    <div class="title">{{data.data.title}}</div>

    <MdPreview 
      :editorId="id" 
      :modelValue="data?.data?.raw"
    />
    <!-- <MdCatalog :editorId="id" :scrollElement="scrollElement" /> -->
  </div>
</template>

<script setup lang="ts">
import { getArticleById, deleteArticle } from "~/api/idnex"
import { MdPreview, MdCatalog } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';

const id = 'preview-only';
// const scrollElement = document.documentElement;

const route = useRoute()
const articleId = route.params.id;
const { data } = await useAsyncData(articleId, () => getArticleById(articleId))

async function handleDelete(){
  try {
    await deleteArticle(articleId)
    navigateTo(`/`)
  } catch (error) {
    console.error(error)
  }
}
</script>