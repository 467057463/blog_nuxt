<template>
  <slider>
    <b>文章分类</b>
    <!-- <el-tree
      :data="categories?.data"
    /> -->
    <ul>
      <li v-for="category in categories?.data">
        <NuxtLink :to="`/search?categoryId=${category.id}`">
          {{category.label}}({{ category._count.articles }})
        </NuxtLink>
        <!-- <ol>
          <li v-for="child in category.children">{{ child.label }}</li>
        </ol> -->
      </li>
    </ul>
    <b>最新文章</b>
    <ul>
      <li v-for="article in articles?.data.list" :key="article.id">
        <NuxtLink :to="`/articles/${article.id}`">
          {{article.title}}
        </NuxtLink>
      </li>
    </ul>
    <b>文章标签</b>
    <div>
      <el-tag
        v-for="tag in tags?.data"
        :key="tag.id"
      >
        <NuxtLink :to="`/search?tagId=${tag.id}`">
          {{tag.label}}
        </NuxtLink>
      </el-tag>
    </div>
  </slider>
</template>

<script setup lang="ts">


const props = defineProps<{
  categoryId: number
}>()

const { data: categories } = getCategoriesWithCount({
  mainCategoryId: props.categoryId
});
const { data: tags} = getTags({
  categoryId: props.categoryId
});
const { data: articles } = getArticles({
  mainCategoryId: props.categoryId
});
</script>