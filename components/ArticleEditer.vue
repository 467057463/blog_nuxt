<template>
  <div class="editer-wrapper">
    <div class="editer-header">
      <el-input v-model="form.title"/>
      <el-button type="primary" plain @click="handleDarft">保存为草稿</el-button>
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
              <NuxtLink to="/drafts">我的草稿</NuxtLink>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <MdEditor @onSave="onSave" v-model="form.content" />
    <el-drawer
      v-model="showMeta"
      title="文章发布"
      direction="rtl"
    >
      <el-form 
        labelWidth="6em" 
        labelSuffix=":" 
        ref="$form"
        :model="form"
      >
        <el-form-item label="分类" prop="category">
          <div class="categories-wrapper">
            <el-check-tag 
              type="primary" 
              size="small" 
              v-for="category in categories" 
              :key="category.id"
              @click="form.categoryId = category.id"
              :checked="form.categoryId === category.id"
            >
              {{category.label}}
            </el-check-tag>
          </div>
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-select v-model="form.tags" multiple :multiple-limit="2">
            <el-option
              v-for="tag in tags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="文章封面">
          <div class="image-list">
            <div class="image-item" v-for="(image, index) in files" :key="image.uid">
              <img :src="image.url" />
              <div class="image-item__actions">
              <span class="image-delete" @click="handleRemove(image)">
                <el-icon><Delete /></el-icon>
              </span>
            </div>
            </div>
          </div>
          <el-upload 
            action="#" 
            list-type="picture-card" 
            :auto-upload="false"
            :limit="1"
            v-model:file-list="files"
            :show-file-list="false"
            v-show="files.length < 1"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="文章描述" prop="describe">
          <el-input 
            type="textarea" 
            v-model="form.describe" 
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
import { Plus, Delete } from '@element-plus/icons-vue'
import { createDraft, updateDraft, createArticle, updateArticle } from '~/api/idnex'

const showMeta = ref(false)
const userStore = useUserStore();
const appStore = useAppStore();

const { userInfo } = storeToRefs(userStore);
const { categories, tags } = storeToRefs(appStore);

const emit = defineEmits(['save'])
const props = defineProps(['draftId', 'articleId', 'title', 'content', 'categoryId', 'tags', 'describe', 'cover'])

const files = ref(props.cover ? [{url: props.cover, uid: 0}] : []);
const form = reactive({
  draftId: props.draftId,
  title: props.title,
  content: props.content,
  categoryId: props.categoryId,
  tags: props.tags.map(i => i.id),
  describe: props.describe,
})

function handleRemove(file){
  files.value = files.value.filter(i => i.uid !== file.uid)
}



// 发布到草稿箱
async function handleDarft(){
  const route = useRoute();
  const router = useRouter();
  console.log(route)
  if(route.name === 'drafts-create'){
    const res: any = await createDraft({
      title: form.title,
      content: form.content,
      articleId: props.articleId
    })
    router.replace(`/drafts/${res.data.id}`)
  } else if(route.name === 'articles-id-edit'){
    const res: any = await createDraft({
      title: form.title,
      content: form.content,
      articleId: props.articleId
    })
    router.replace(`/drafts/${res.data.id}`)
  } else if(route.name === 'drafts-id'){
    const draftId = Number(route.params.id);
    const res: any = await updateDraft(draftId, {
      title: form.title,
      content: form.content,
    })
  }
}

// 发布
async function handleSubmit(){
  const route = useRoute();
  const router = useRouter();
  const formdata = new FormData()
  for (const [key, value] of Object.entries(form)) {
    formdata.append(key, value)
  }
  if(files.value[0]?.raw){
    formdata.append('cover', files.value[0]?.raw)
  }
  console.log(formdata)
   let res;
  if(route.name === 'drafts-id'){
    if(props.articleId){
      res = await updateArticle(props.articleId, formdata)
    } else {
      res = await createArticle(formdata)
    }
  } else if(route.name === 'drafts-create'){
    res = await createArticle(formdata)
  } else if(route.name === 'articles-id-edit'){
    res = await updateArticle(props.articleId, formdata)
  }
  router.replace(`/articles/${res.data.id}`)

  // navigateTo(`/articles/${res.data.id}`)
  // console.log(formdata)
  // emit('save', formdata)
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

.image-list{
  display: flex;
  .image-item {
    width: 60px;
    height: 60px;

    margin-right: 15px;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      border-radius: 4px;
      overflow: hidden;
    }

    .image-item__actions {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      &:hover {
        .image-delete {
          visibility: visible;
        }
      }
    }

    .image-delete {
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 8px;
      overflow: hidden;
      top: -5px;
      right: -5px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #ed3232;
      font-size: 10px;
      color: #fff;
      border: 1px solid #fff;
      cursor: pointer;
      visibility: hidden;

      &:hover {
        background: #fd4f4f;
      }
    }
  }
}

::v-deep{
  .el-upload--picture-card {
    width: 60px;
    height: 60px;
    line-height: 60px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #e2e2e2;
    border-radius: 4px;
  }
}

</style>