<template>
  <div class="editer-wrapper">
    <div class="editer-header">
      <el-input v-model="form.title"/>
      <el-button type="primary" plain @click="handleSubmit('DARFT')">保存为草稿</el-button>
      <el-button type="primary" @click="showMeta = true">发布</el-button>
      <el-dropdown>
        <div class="user-info">
          <i class="fi fi-user"></i>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <NuxtLink to="/">返回首页</NuxtLink>
            </el-dropdown-item>
            <el-dropdown-item>
              <NuxtLink to="/articles/drafts">我的草稿</NuxtLink>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <MdEditor v-model="form.content" />
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
              v-for="category in categories?.data" 
              :key="category.id"
              @click="form.categoryId = category.id"
              :checked="form.categoryId === category.id"
            >
              {{category.label}}
            </el-check-tag>
          </div>
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-select v-model="form.tagIds" multiple>
            <el-option
              v-for="tag in tags?.data"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            />
          </el-select>
        </el-form-item>


        <el-form-item label="文章封面">
          <img class="prev-img" :src="form.cover" v-if="form.cover" @click="showUploader = true"/>
          <div v-else @click="showUploader = true" class="upload-btn">
            <el-icon><Plus/></el-icon>
          </div>
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
          <el-button type="primary" @click="handleSubmit('OFFICIAL')">确认发布</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
    <my-upload 
      v-model="showUploader"
      img-format="png"
      :width="154"
		  :height="154"
      @crop-success="cropSuccess"
      noCircle
    />
  </div>
</template>

<script lang="ts" setup>
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { Plus } from '@element-plus/icons-vue';
import { createArticle, getTags, getCategories, getArticleDraftById } from '~/api/idnex';
import { ArticleStatus } from '@prisma/client';
// @ts-ignore
import myUpload from 'vue-image-crop-upload';
import { ElMessage } from 'element-plus'

const { data: tags } = getTags();
const { data: categories } = getCategories();

const props = defineProps<{
  mode: 'create' | 'edit',
  articleId?: string
}>()

const showMeta = ref(false);

const form = reactive<{
  title: string,
  content: string,
  categoryId?: number,
  tagIds: number[],
  cover?: string,
  describe?: string

  darftId?: number,
  parentId?: number,
}>({
  title: '',
  content: '',
  categoryId: 1,
  tagIds: [],
  cover: '',
  describe: '',

  darftId: undefined,
  parentId: undefined
})

// 封面
const showUploader = ref(false)
function cropSuccess(imgDataUrl: string){
  form.cover = imgDataUrl;
}

// 编辑模式
if(props.mode === 'edit'){
  getArticleDraftById(props.articleId!).then(res => {
    Object.assign(form, res)
  }).catch(error => {
    console.error(error)
    navigateTo('/')
  })
}

// 生成 formdata
function generateData(type: ArticleStatus = "DARFT"){
  const {cover, ...res} = form;
  const formdata = dataToFormData({
    ...res,
    status: type
  })
  if(cover && !cover.startsWith("http")){
    formdata.append('cover', dataURLtoBlob(cover), 'image.png')
  } else {
    formdata.append('cover', cover)
  }
  return formdata;
}

// 保存
async function handleSubmit(type: "OFFICIAL" | "DARFT" = "DARFT"){
  const formdata = generateData(type);
  try {
    const res = await createArticle(formdata)
    if(res.status === 'OFFICIAL'){
      navigateTo(`/articles/${res.id}`)
      ElMessage({
        type: "success",
        message: '文章发布成功'
      })
    } else {
      navigateTo(`/articles/${res.id}/edit`)
      ElMessage({
        type: "success",
        message: '文章保存成功'
      })
    }
  } catch (error) {
    console.error(error)
  }
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

.upload-btn{
  width: 77px;
  height: 77px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #e2e2e2;
  border-radius: 4px;
  font-size: 28px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
}
.prev-img{
  height: 77px;
  width: 77px;
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