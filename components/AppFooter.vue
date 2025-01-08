<template>
  <footer>
    <div>Designed & Powerd by <a href="https://www.mmisme.cn">maoyouwen</a></div>
    <div>Copyright© 2009-2024 mmisme-毛毛前端技术博客</div>
    <div><a href="https://beian.miit.gov.cn" target="_blank">鄂ICP备 2024037189</a></div>
  </footer>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
footer{
  display: flex;
  flex-direction: column;
  align-items: center;
  background: getCssVar('color', 'gray-10');
  color: getCssVar('text', 'color', 'gray-5--gray-5');
  font-size: 14px;
  padding: 15px 0;
  flex-shrink: 0;
  margin-top: 10px;
  border-top: 1px solid getCssVar("border", "color", 'gray-1--gray-8');
  a{
    text-decoration: none;
    color: getCssVar('text', 'color', 'gray-5--gray-5');
    &:hover{
      text-decoration: underline;
      color: getCssVar('color', 'gray-1')
    }
  }
}
</style>