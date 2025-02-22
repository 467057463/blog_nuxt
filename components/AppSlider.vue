<template>
  <slider>
    <b>文章分类</b>
    <!-- <el-tree
      :data="categories?.data"
    /> -->
    <ul>
      <li v-for="category in categories?.data">
        {{category.label}}
        <ol>
          <li v-for="child in category.children">{{ child.label }}</li>
        </ol>
      </li>
    </ul>
    <b>最新文章</b>
    <ul>
      <li v-for="article in articles?.data.list" :key="article.id">{{article.title}}</li>
    </ul>
    <b>文章标签</b>
    <div>
      <el-tag
        v-for="tag in tags?.data"
        :key="tag.id"
      >{{tag.label}}</el-tag>
    </div>
  </slider>
</template>

<script setup lang="ts">

const props = defineProps<{
  categoryId: number
}>()

const { data: categories } = getCategories();
const { data: tags} = getTags();
const { data: articles } = getArticles({
  mainCategoryId: props.categoryId
});
</script>