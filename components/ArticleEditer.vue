<template>
  <div>
    <el-input v-model="title"/>
    <MdEditor @onSave="onSave" v-model="text" />
  </div>
</template>

<script setup lang="ts">
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
const labelReg = /<[^>]+>/g;
const whiteReg = /\s/g;


const emit = defineEmits(['save'])
const props = defineProps(['title', 'content'])

const title = ref(props.title);
const text = ref(props.content);


function onSave(v, h){
  console.log(v, h)

  h.then((html) => {
    emit('save', {
      title: title.value,
      content: html,
      raw: v,
      describe: html.replace(labelReg, '').replace(whiteReg, ''),
      categoryId: 1,
      tags: ['css']
    })
  });
}
</script>