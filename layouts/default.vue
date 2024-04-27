<template>
  <div>
    <AppHeader />
    <slot />
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
const user = useUserStore();

</script>