<template>
  <div>index</div>
</template>

<script lang="ts" setup>
import { getArticles } from '~/api/idnex'

const res = await getArticles({page: 1, limit: 1})
console.log('res', res)


let token = useCookie('token',{
  maxAge: 60 * 24 * 30
})
token = '123456' as any;
console.log('token', token)

const { data } = await useAsyncData('articles', () => getArticles({page: 1, limit: 1}))
console.log('res', data)
</script>