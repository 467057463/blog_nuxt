<template>
  <div class="editer-wrapper">
    <!-- 标题 -->
    <div class="editer-header">
      <el-input v-model="form.title"/>
      <div class="meta-icon">
        <el-icon @click="showMeta = true"><More /></el-icon>
      </div>
    </div>
    <!-- 正文 -->
    <MdEditor v-model="form.content" />
    <!-- 底部 -->
    <div class="editer-nav">
      <div class="nav-wrapper">
        <NuxtLink to="/">
          返回首页
        </NuxtLink>
        <NuxtLink to="/articles/darfts">
          我的草稿
        </NuxtLink>
      </div>
      <el-button type="primary" plain @click="handleSubmit('DARFT')">保存为草稿</el-button>
      <el-button type="primary" @click="showMeta = true">发布</el-button>
    </div>
    <!-- 配置信息 -->
    <el-drawer
      v-model="showMeta"
      title="文章发布"
      direction="rtl"
      size="100%"
    >
      <el-form 
        labelWidth="5em" 
        ref="$form"
        :model="form"
      >
        <el-form-item label="分类" prop="category">
          <el-tree-select
            v-model="form.categoryId"
            :data="categories?.data"
            :props="{
              value: 'id',
            }"
            default-expand-all
            @node-click="handleCategoryChange"
            placeholder="请选择分类"
          />
          <el-button type="text" style="margin-left: 10px;" @click="categoryDialog = true">添加分类</el-button>
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-select v-model="form.tagIds" placeholder="请选择标签" multiple>
            <el-option
              v-for="tag in tagList"
              :key="tag.id"
              :label="tag.label"
              :value="tag.id"
            />
          </el-select>
          <el-button type="text" style="margin-left: 10px;" @click="tagDialog = true">添加标签</el-button>
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
          <el-button type="primary" plain @click="handleSubmit('DARFT')">保存为草稿</el-button>
          <el-button type="primary" @click="handleSubmit('OFFICIAL')">确认发布</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
    <!-- 图片上传 -->
    <my-upload 
      v-model="showUploader"
      img-format="png"
      :width="154"
		  :height="154"
      @crop-success="cropSuccess"
      noCircle
    />
    <!-- 添加分类 -->
    <el-dialog v-model="categoryDialog" title="添加分类">
      <el-form :model="categoryForm" labelWidth="5em" ref="$categoryForm" :rules="categoryFormRules" >
        <el-form-item label="主分类"  prop="parentId">
          <el-select v-model="categoryForm.parentId">
            <el-option
              v-for="category in categories?.data"
              :key="category.id"
              :label="category.label"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="label">
          <el-input v-model="categoryForm.label" />
        </el-form-item>
        <el-form-item label="值" prop="name">
          <el-input v-model="categoryForm.name" />
        </el-form-item>
        <el-form-item label="排序" prop="order">
          <el-input v-model.number="categoryForm.order" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitCategory">确认</el-button>
          <el-button type="primary" plain @click="categoryDialog = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 添加标签 -->
    <el-dialog v-model="tagDialog" title="添加标签">
      <el-form :model="tagForm" labelWidth="5em" ref="$tagForm" :rules="tagFormRules">
        <el-form-item label="分类"  prop="categoryId">
          <el-select v-model="tagForm.categoryId">
            <el-option
              v-for="category in categories?.data"
              :key="category.id"
              :label="category.label"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="label">
          <el-input v-model="tagForm.label" />
        </el-form-item>
        <el-form-item label="值" prop="name">
          <el-input v-model="tagForm.name" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitTag">确认</el-button>
          <el-button type="primary" plain @click="tagDialog = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>

<script lang="ts" setup>
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { Plus, More } from '@element-plus/icons-vue';
import { createArticle, getTags, getCategories, getArticleDraftById } from '~/api';
import { ArticleStatus } from '@prisma/client';
// @ts-ignore
import myUpload from 'vue-image-crop-upload';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

const { data: tags, refresh: refreshTag } = getTags();
const { data: categories, refresh: refreshCategory } = getCategories();

const props = defineProps<{
  mode: 'create' | 'edit',
  articleId?: string
}>()

const showMeta = ref(true);

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
  categoryId: '',
  tagIds: [],
  cover: '',
  describe: '',

  darftId: undefined,
  parentId: undefined
})

// 分类
const mainCategoryId = ref(1)
const $categoryForm = ref<FormInstance>();
const categoryDialog = ref(false);
const categoryForm = reactive({
  parentId: 1,
  name: '',
  label: '',
  order: 0,
})

const categoryFormRules = reactive<FormRules>({
  parentId: [
    {
      required: true,
      message: '请选择一级分类',
      trigger: 'blur'
    }
  ],
  label: [
    {
      required: true,
      message: '请输入分类名称',
      trigger: 'blur'
    }
  ],
  name: [
    {
      required: true,
      message: '请输入分类值',
      trigger: 'blur'
    }
  ],
  order: [
    {
      required: true,
      message: '请输入排序值',
      trigger: 'blur'
    }
  ]
})

function handleCategoryChange(item){
  if(item.parentId && item.parentId !== mainCategoryId.value){
    form.tagIds = []
    mainCategoryId.value = item.parentId
  }
}

async function submitCategory(){
  try {
    await $categoryForm?.value?.validate();
    await createCategory(categoryForm)
    refreshCategory()
    categoryDialog.value = false;
    ElMessage({
      type: 'success',
      message: '分类添加成功'
    })
  } catch (error) {
    console.error(error)
  }
}

// 标签
const tagList = computed(() => {
  return tags.value?.data.filter(i => i.categoryId === mainCategoryId.value)
})
const $tagForm = ref<FormInstance>();
const tagDialog = ref(false);
const tagForm = reactive({
  categoryId: 1,
  name: '',
  label: '',
})
const tagFormRules = reactive<FormRules>({
  categoryId: [
    {
      required: true,
      message: '请选择分类',
      trigger: 'blur'
    }
  ],
  label: [
    {
      required: true,
      message: '请输入标签名称',
      trigger: 'blur'
    }
  ],
  name: [
    {
      required: true,
      message: '请输入标签值',
      trigger: 'blur'
    }
  ]
})
async function submitTag(){
  try {
    await $tagForm?.value?.validate();
    await createTga(tagForm)
    refreshTag();
    tagDialog.value = false;
    ElMessage({
      type: 'success',
      message: '标签添加成功'
    })
  } catch (error) {
    console.error(error)
  }
}

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
  height: 100dvh;
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
    .meta-icon{
      cursor: pointer;
    }
    .user-info{
      margin-left: 12px;
    }
  }
  .editer-nav{
    display: flex;
    align-items: center;
    height: 64px;
    padding: 0 10px;
    a{
      font-size: 14px;
      text-decoration: none;
      color: getCssVar("text", "color", 'normal');
      &:hover{
        color: getCssVar('text', 'color', 'gray-7--gray-2');
        text-decoration: underline;
      }
    }
    a + a {
      margin-left: 5px;
    }
    .nav-wrapper{
      flex: 1;
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