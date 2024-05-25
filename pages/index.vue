<template>
  <div class="page-left">
    <ul class="sub-nav">
      <li>全部</li>
      <li v-for="item in tags" :key="item.id">{{item.name}}</li>
    </ul>
  </div>

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
            <!-- <el-avatar 
              class="avatar" 
              :src="article.author.profile.avatar" 
              :size="26"
              /> -->
            <span>作者：{{ article.author.username }} </span>
            <span>发布于：{{ article.createdAt }}</span>
          </div>

          <div class="tags">
            <el-tag type="primary" v-for="tag in article.tags" :key="tag.id">{{ tag.name }}</el-tag>
          </div>
        </div>
      </div>
      <el-image :src="article.cover" v-if="article.cover"/>
    </div>
  </div>

  <div class="page-right">
    <div class="hot-recommend">
      <div class="title">文章推荐</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const appStore = useAppStore();
import { getArticles } from '~/api/idnex'
const { data } = await useAsyncData('articles', () => getArticles())

const { tags } = storeToRefs(appStore);

</script>

<style lang="scss" scoped>

.page-left{
  width: 180px;
  .sub-nav{
    background: #ffffff;
    border-radius: 4px;
    list-style: none;
    padding: 0;
    margin: 0;
    padding: 10px;
    box-shadow: 0 2px 8px #f2f3f5;
    li{
      height: 46px;
      display: flex;
      align-items: center;
      padding: 0 18px;
      font-size: 16px;
      color: #515767;
      &:hover{
        cursor: pointer;
        background: #f7f9fa;
        color: #1e80ff;
      }
    }
  }
}

.page-right{
  width: 260px;
  flex-shrink: 0;
  .title{
    height: 48px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f0f0f2;
    color: #222226;
    padding: 0 20px;
  }
  .hot-recommend{
    background: #ffffff;
    border-radius: 4px;
  }
}
.page-center{
  background: #ffffff;
  border-radius: 4px;
  padding: 10px 10px;
  flex: 1;
  margin: 0 20px;
  box-shadow: 0 2px 8px #f2f3f5;
}
.article-item{
  padding: 8px 10px;
  display: flex;
  align-items: flex-start;
  .content-container{
    flex: 1;
  }
  .el-image{
    height: 77px;
    width: 110px;
    margin-left: 10px;
  }
  .title {
    a{
      font-size: 16px;
      color: #222226;
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
      color: #555666;
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
  }
  .user-info{
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #808080;
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
  border-top: 1px solid #eeeeee;
}
</style>