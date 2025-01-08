<template>
  <div class="login-page">
    <el-form 
      @submit.prevent 
      ref="$form" 
      :model="form" 
      :rules="rules" 
      label-width="4em"
      label-position="top"
      size="large"
    >
      <el-form-item 
        label="用户名" 
        prop="username"
      >
        <el-input 
          v-model="form.username" 
          placeholder="请输入用户名"
        />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input 
          v-model="form.password" 
          type="password"
          placeholder="请输入密码"
        />
      </el-form-item>
      <el-form-item 
        label="验证码" 
        prop="code" 
        class="code-wrapper"
      >
        <el-input 
          v-model="form.code"
          placeholder="请输入验证码"
        />
        <span 
          v-html="data?.data.captcha" 
          @click="handleCaptcha"
        ></span>
      </el-form-item>
      <el-form-item>
        <el-button 
          @click="handleLogin" 
          native-type="submit" 
          type="primary"
          class="submit-btn"
        >登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules  } from 'element-plus'
import { fetchLogin, getCaptcha } from '~/api/idnex'
const userStore = useUserStore()

const form = reactive({
  username: '',
  password: '',
  code: ''
});
const $form = ref<FormInstance>();
const rules = reactive<FormRules>({
  username: [
    { 
      required: true, 
      message: '请输入用户名', 
      trigger: 'blur' 
    },
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur' 
    }
  ],
  code: [
    {
      required: true,
      message: '请输入验证码',
      trigger: 'blur' 
    }
  ]
});
// 刷新验证码
const { data, refresh: handleCaptcha } = getCaptcha();
// 登录
async function handleLogin(){
  try {
    await $form?.value?.validate();
    await userStore.login({
      ...form,
      uuid: data.value?.data.uuid
    });
    navigateTo('/')
  } catch (error) {
    console.error((error as any)._data);
    handleCaptcha()
  };
}
</script>

<style lang="scss">
.login-page{
  width: 100%;
  .el-form{
    background: #ffffff;
    padding:  40px;
    max-width: 300px;
    margin: 0 auto
  }

  .code-wrapper{
    .el-form-item__content{
      display: flex;
      width: 100%;
      .el-input{
        flex: 1;
      }
      & > span{
        height: 100%;
        line-height: 1;
        cursor: pointer;
      }
    }
  }

  .submit-btn{
    width: 100px;
  }
}
</style>