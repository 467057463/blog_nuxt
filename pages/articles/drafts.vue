<template>
  <div class="draft-list">
    <span>我的草稿</span>

    <div 
      class="draft-item" 
      v-for="draft in data?.data.list" 
      :key="draft.id" 
    >
      <NuxtLink :to="`/articles/${draft.id}/edit`">
        {{ draft.title }}
      </NuxtLink>

      <div class="action">
        <NuxtLink 
          v-if="draft?.parent?.id" 
          :to="`/articles/${draft?.parent?.id}`"
        >相关文章</NuxtLink>
        <span @click="handleDestroy(draft.id)">删除</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getArticles, deleteArticle } from '~/api/idnex'

definePageMeta({
  middleware: ['auth']
})

const { data, refresh } = getArticles({
  status: 'DARFT'
})

async function handleDestroy(id: number){
  try {
    await deleteArticle(id);
    await refresh()
  } catch (error) {
    console.error(error)
  }
}
</script>

<style lang="scss" scoped>
.draft-list{
  width: 100%;
}
.draft-item{
  display: flex;
  justify-content: space-between;
  .action{
    font-size: 14px;
    color: #808080;
    span{
      margin-left: 10px;
      cursor: pointer;
    }
  }
}
</style>