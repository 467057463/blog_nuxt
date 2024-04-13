<template>
  <div>
    <!-- <NuxtWelcome /> -->
    {{ runtimeConfig.public.api }}
    {{ appConfig.title }}
  </div>
</template>

<script lang="ts" setup>
const runtimeConfig = useRuntimeConfig()
console.log(runtimeConfig.public.api)

const appConfig = useAppConfig();
console.log(appConfig.title)
</script>
