<template>
  <div class="editer-wrapper">
    <div class="editer-header">
      <el-input v-model="formData.title"/>
      <el-button type="primary" plain>保存为草稿</el-button>
      <el-button type="primary" @click="showMeta = true">发布</el-button>
      <el-dropdown>
        <div class="user-info">
          <el-avatar :src="userInfo.profile.avatar" class="avatar" :size="30"/>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <NuxtLink to="/">返回首页</NuxtLink>
            </el-dropdown-item>
            <el-dropdown-item>
              <NuxtLink to="/">我的草稿</NuxtLink>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <MdEditor @onSave="onSave" v-model="formData.content" />
    <el-drawer
      v-model="showMeta"
      title="文章发布"
      direction="rtl"
    >
      <el-form 
        labelWidth="6em" 
        labelSuffix=":" 
        ref="$form"
        :model="formData"
      >
        <el-form-item label="分类" prop="category">
          <div class="categories-wrapper">
            <el-check-tag 
              type="primary" 
              size="small" 
              v-for="category in categories" 
              :key="category.id"
              @click="formData.categoryId = category.id"
              :checked="formData.categoryId === category.id"
            >
              {{category.name}}
            </el-check-tag>
          </div>
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-select v-model="formData.tags" multiple :multiple-limit="2">
            <el-option
              v-for="tag in tags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="文章封面">
          
        </el-form-item>

        <el-form-item label="文章描述" prop="describe">
          <el-input 
            type="textarea" 
            v-model="formData.describe" 
            maxlength="140" 
            show-word-limit 
            rows="6"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">确认发布</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
const labelReg = /<[^>]+>/g;
const whiteReg = /\s/g;

const showMeta = ref(false)
const userStore = useUserStore();
const appStore = useAppStore();

const { userInfo } = storeToRefs(userStore);
const { categories, tags } = storeToRefs(appStore);

const emit = defineEmits(['save'])
const props = defineProps(['title', 'content', 'categoryId', 'tags', 'describe'])

const formData = reactive({
  title: props.title,
  content: props.content,
  categoryId: props.categoryId,
  tags: props.tags.map(i => i.id),
  describe: props.describe,
})

function onSave(v, h){
  console.log(v, h)

  h.then((html) => {
    emit('save', {
      title: title.value,
      content: v,
      // raw: v,
      describe: html.replace(labelReg, '').replace(whiteReg, ''),
      categoryId: 1,
      tags: ['css']
    })
  });
}

function handleSubmit(){
  emit('save', formData)
}
</script>

<style lang="scss" scoped>
.editer-wrapper{
  height: 100vh;
  display: flex;
  flex-direction: column;
  .editer-header{
    height: 64px;
    display: flex;
    align-items: center;
    background: #ffffff;
    padding: 0 20px;
    .el-input{
      height: 64px;
      border: none;
      font-size: 30px;
    }
    ::v-deep .el-input__wrapper{
      box-shadow: none;
    }
    ::v-deep .el-input__inner{
      color: #000000;
    }
    .user-info{
      margin-left: 12px;
    }
  }
}
.md-editor{
  flex: 1;
}

.categories-wrapper{
  .el-check-tag + .el-check-tag{
    margin-left: 8px;
  }
}
</style>