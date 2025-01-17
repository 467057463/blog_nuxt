<template>
  <div class="page-center">
    <div 
      v-for="article in data?.data.list" 
      :key="article.id" 
      class="article-item"
    >
      <div class="content-container">
        <div class="title">
          <NuxtLink :to="`/articles/${article.id}`">{{ article.title }}</NuxtLink>
        </div>
        <div class="content">
          <NuxtLink :to="`/articles/${article.id}`">{{ article.describe }}</NuxtLink>
        </div>
        <div class="meta">
          <div class="user-info">
            <span>作者：{{ article.author.username }} </span>
            <span>发布于：{{ article.createdAt }}</span>
          </div>
        </div>
      </div>
      <el-image :src="article.cover" v-if="article.cover" fit="cover"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getArticles } from '@/api/idnex'
const { data } = getArticles({
  categoryId: 1
});
</script>

<style lang="scss" scoped>
.article-item{
  padding: 8px 0;
  margin: 0 24px;
  display: flex;
  align-items: flex-start;
  .content-container{
    flex: 1;
  }
  .el-image{
    height: 77px;
    width: 110px;
    margin-left: 10px;
    border-radius: 3px;
    overflow: hidden;
  }
  .title {
    a{
      font-size: 16px;
      color: getCssVar('text', 'color', 'gray-10--gray-0');
      font-weight: bold;
      text-decoration: none;
      &:hover{
        text-decoration: underline;
      }
    }
  }
  .content {
    margin: 5px 0;
    a {
      text-decoration: none;
      color: getCssVar('text', 'color', 'gray-6--gray-4');
      font-size: 14px;
      word-break: break-all;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2; /* 这里是超出几行省略 */
      overflow: hidden;
    }
  }
  .meta{
    display: flex;
    justify-content: space-between;
    color: getCssVar('text', 'color', 'gray-6--gray-4');
  }
  .user-info{
    display: flex;
    align-items: center;
    font-size: 14px;
    color: getCssVar('text', 'color', 'gray-6--gray-4');
    .avatar{
      margin-right: 6px;
    }
    span + span {
      margin-left: 8px;
    }
  }

  &:Hover{
    background: #f5f5f580;
  }
}
.article-item + .article-item {
  border-top: 1px solid getCssVar('border', 'color', 'gray-1--gray-8');
}
</style>