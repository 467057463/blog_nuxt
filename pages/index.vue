<template>
  <div class="page-content">
    <div class="page-wrapper">
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

            <div class="meta">
              <div class="user-info">
                <span>作者：{{ article.author.username }} </span>
                <span>发布于：{{ article.createdAt }}</span>
              </div>
            </div>

            <div class="content">
              <NuxtLink :to="`/articles/${article.id}`">{{ article.describe }}</NuxtLink>
            </div>
            
            <div class='read-more'>
              <NuxtLink :to="`/articles/${article.id}`">阅读全文...</NuxtLink>
            </div>

            <div class="tags">
              <span>标签：</span>
              <NuxtLink v-for="tag in article.tags" :key="tag.id" :to="`/articles/${tag.id}`">{{tag.label}}</NuxtLink>
            </div>

            <div class="category">
              <span>分类：</span>
              <NuxtLink :to="`/articles/${article.category?.id}`">{{article.category?.label}}</NuxtLink>
            </div>
          </div>
          <el-image :src="article.cover" v-if="article.cover" fit="cover"/>
        </div>
      </div>
    </div>
  </div>

  <AppSlider :categoryId="1"/>
</template>

<script lang="ts" setup>
const { data } = getArticles({
  mainCategoryId: 1
});

</script>

<style lang="scss" scoped>
.article-item{
  margin: 0 24px;
  display: flex;
  align-items: center;
  .content-container{
    flex: 1;
  }
  .el-image{
    height: 108px;
    width: 168px;
    margin-left: 10px;
    border-radius: 3px;
    overflow: hidden;
  }
  .title {
    margin-top: 30px;
    a{
      font-size: 26px;
      color: getCssVar('text', 'color', 'gray-10--gray-0');
      font-weight: bold;
      text-decoration: none;
      &:hover{
        color: getCssVar('color', 'brand-sub');
        text-decoration: underline;
      }
    }
  }
  .content {
    margin-top: 10px;
    a {
      text-decoration: none;
      color: getCssVar('text', 'color', 'gray-7--gray-2');
      font-size: 16px;
      word-break: break-all;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2; /* 这里是超出几行省略 */
      overflow: hidden;
    }
  }
  .meta{
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    color: getCssVar('text', 'color', 'gray-6--gray-4');
    margin-top: 5px;
  }
  .user-info{
    display: flex;
    align-items: center;
    // font-size: 14px;
    color: getCssVar('text', 'color', 'gray-6--gray-4');
    .avatar{
      margin-right: 6px;
    }
    span + span {
      margin-left: 8px;
    }
  }
  .read-more{
    margin-top: 10px;
    font-size: 14px;
    // font-weight: bolder;
    a{
      color: getCssVar('text', 'color', 'gray-7--gray-2');
      text-decoration: none;
      &:hover{
        color: getCssVar('color', 'brand-sub');
        text-decoration: underline;
      }
    }
  }
  .tags{
    font-size: 14px;
    margin-top: 10px;
    color: getCssVar('text', 'color', 'gray-6--gray-4');
    a {
      color: getCssVar('color', 'brand');
      text-decoration: none;
      &:hover{
        color: getCssVar('color', 'brand-sub');
        text-decoration: underline;
      }
    }
    a + a {
      margin-left: 5px;
    }
  }
  .category{
    font-size: 14px;
    margin-top: 6px;
    color: getCssVar('text', 'color', 'gray-6--gray-4');
    a {
      color: getCssVar('color', 'brand');
      text-decoration: none;
      &:hover{
        color: getCssVar('color', 'brand-sub');
        text-decoration: underline;
      }
    }
  }
  // &:Hover{
  //   background: #f5f5f580;
  // }
}
// .article-item + .article-item {
//   border-top: 1px solid getCssVar('border', 'color', 'gray-1--gray-8');
// }
</style>