<template>
  <div class="hot-recommend">
    <div class="title">文章推荐</div>
    <div class="content">
      <ul>
        <li v-for="article in data?.data" :key="article.id">
          <NuxtLink :to="`/articles/${article.id}`">{{ article.title }}</NuxtLink>
        </li>
      </ul>
    </div>
  </div>
  
</template>

<script lang="ts" setup>
import { getHotArtices } from '~/api/idnex'
let { data } = await useAsyncData(() => getHotArtices())
console.log(data)
</script>

<style lang="scss" scoped>
.hot-recommend{
  background: #ffffff;
  border-radius: 4px;
  .title{
    height: 48px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f0f0f2;
    color: #222226;
    padding: 0 20px;
  }
  .content{
    padding: 10px 20px 15px;
  }
  ul{
    list-style: none;
    list-style-position: outside;
    margin: 0;
    padding: 0;
  }
  li{
    font-size: 14px;
    height: 26px;
    display: flex;
    align-items: center;
    a{
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>