<template>
  <div class="page-left">

  </div>

  <div class="page-center">
    <div class="actions">
      <NuxtLink :to="data.data.draft ? `/drafts/${data.data.draft.id}` : `/articles/${$route.params.id}/edit`">编辑</NuxtLink>
 
      <span @click="handleDelete">删除</span>
    </div>

    <div class="title">{{data.data.title}}</div>

    <div class="meta">
      {{ data.data.author.username }} 
      {{ data.data.createdAt }}
    </div>

    <MdPreview 
      :editorId="id" 
      :modelValue="data?.data?.content"
    />
  </div>

  <div class="page-right">
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

function handleEdit(){

}

async function handleDelete(){
  try {
    await deleteArticle(articleId)
    navigateTo(`/`)
  } catch (error) {
    console.error(error)
  }
}
</script>

<style lang="scss" scoped>
.page-center{
  background: #ffffff;
  border-radius: 4px;
  padding: 32px;
  flex: 1;
  margin: 0 20px;
  box-shadow: 0 2px 8px #f2f3f5;
  position: relative;
  .title{
    font-size: 32px;
    font-weight: 600;
    color: #333333;
  }
  .actions{
    font-size: 14px;
    position: absolute;
    right: 32px;
    color: #8a919f;
    a{
      color: #8a919f;
      text-decoration: none;
      &:hover{
        text-decoration: underline;
      }
    }
    span{
      margin-left: 8px;
      cursor: pointer;
      &:hover{
        text-decoration: underline;
      }
    }
  }
  .meta{
    color: #8a919f;
    font-size: 14px;
  }
  .md-editor-previewOnly{
    margin-top: 10px;
  }
  ::v-deep .md-editor-preview-wrapper{
    padding: 0;
  }
}

.page-right{
  width: 260px;
}

</style>