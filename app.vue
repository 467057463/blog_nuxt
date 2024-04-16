<template>
  <div>
    <!-- <NuxtWelcome /> -->
    {{ runtimeConfig.public.api }}
    {{ appConfig.title }}
    这是离目标最近的一次了
  </div>
</template>

<script lang="ts" setup>
const runtimeConfig = useRuntimeConfig()
console.log(runtimeConfig.public.api)

const appConfig = useAppConfig();
console.log(appConfig.title)
</script>
