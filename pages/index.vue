<template>
  <div class="page-left">
    <ul class="sub-nav">
      <li :class="{active: currentTag === 'all'}">
        <NuxtLink to="/">全部</NuxtLink></li>
      <li 
        v-for="item in tags" 
        :key="item.id" 
        :class="{active: currentTag === item.name}"
      >
        <NuxtLink :to="`/?tag=${item.name}`">{{item.name}}</NuxtLink></li>
    </ul>
  </div>

  <div class="page-center">
    <div 
      v-for="article in data?.list" 
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

          <!-- <div class="tags">
            <el-tag type="primary" v-for="tag in article.tags" :key="tag.id">{{ tag.name }}</el-tag>
          </div> -->
        </div>
      </div>
      <el-image :src="article.cover" v-if="article.cover" fit="cover"/>
    </div>

    <NuxtLink 
      v-show="false"
      v-for="page in data.pages"
      :key="page"
      :to="{path: '/', query: {...route.query, page: page}}"
    >
      {{ page }}
    </NuxtLink>

    <el-pagination 
      layout="prev, pager, next" 
      :total="data.count" 
      hide-on-single-page
      :default-current-page="data.currentPage"
      @current-change="pageChange"
      @prev-click="pageChange"
      @next-click="pageChange"
    />
  </div>

  <div class="page-right">
    <!-- <div class="hot-recommend">
      <div class="title">文章推荐</div>
    </div> -->
    <hot-recommend/>
  </div>
</template>

<script lang="ts" setup>
import { getArticles } from '~/api/idnex'
const appStore = useAppStore();
const route = useRoute();

let { data } = await useAsyncData(() => getArticles(route.query))
const { tags } = storeToRefs(appStore);
const currentTag = computed(() => route.query.tag || 'all')

async function handleAll(){
  navigateTo(`/`)
  const res = await getArticles();
  console.log(data.value, res)
  data.value = res;
}

async function handleTagClick(item){
  navigateTo(`/?categoryId=1&tag=${item.name}`)
  const res = await getArticles({
    categoryId: "1",
    tag: item.name,
  });
  console.log(data.value, res)
  data.value = res;
}

const currentPage = computed(() => Number(route.query.page || 1)) 

function pageChange(page){
  navigateTo({
    path: '/',
    query: {
      ...route.query, 
      page
    }
  })
}


watchEffect(async () => {
  const res = await getArticles(route.query);
  console.log(data.value, res)
  data.value = res;
})
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
      &:hover, &.active{
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
    border-radius: 3px;
    overflow: hidden;
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