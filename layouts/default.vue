<template>
  <AppHeader />
  <main>
    <div class="page-content">
      <div class="page-wrapper">
        <slot />
      </div>
    </div>

    <slider>
      <b>文章分类</b>
      <b>最新文章</b>
      <b>文章标签</b>
    </slider>
  </main>
  <AppFooter />
</template>
