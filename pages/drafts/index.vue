<template>
  <div class="draft-list">
    <span>我的草稿</span>

    <div 
      class="draft-item" 
      v-for="draft in data.data" 
      :key="draft.id" 
    >
      <NuxtLink :to="`/drafts/${draft.id}`">
        {{ draft.title }}
      </NuxtLink>

      <div class="action">
        <NuxtLink 
          v-if="draft.article_id" 
          :to="`/articles/${draft.article_id}`"
        >相关文章</NuxtLink>
        <span @click="handleDestroy(draft.id)">删除</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getDraftList, destroyDraft } from '~/api/idnex'
definePageMeta({
  middleware: 'auth'
})

const { data, refresh } = await useAsyncData('articles', () => getDraftList())


async function handleDestroy(id){
  try {
    await destroyDraft(id);
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