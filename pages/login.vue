<template>
  <div>login</div>
  <el-form @submit.prevent ref="$form" :model="form" :rules="rules">
    <el-form-item label="用户名" prop="name">
      <el-input v-model="form.username"/>
    </el-form-item>

    <el-form-item label="密码">
      <el-input v-model="form.password" type="password"/>
    </el-form-item>
    <el-button @click="handleLogin" native-type="submit">登录</el-button>
  </el-form>
</template>

<script setup lang="ts">
const userStore = useUserStore()

const $form = ref('');
const rules = reactive({
  username: [
    { 
      required: true, 
      message: 'Please input Activity name', 
      trigger: 'blur' 
    },
    { 
      min: 6, 
      max: 12,
      message: 'Length should be 6 to 12', 
      trigger: 'blur'
    },
  ]
});
const form = reactive({
  username: '',
  password: ''
});

async function handleLogin(){
  try {
    await $form.value.validate();
    await userStore.login(form);
    navigateTo('/')
  } catch (error) {
    console.error(error);
  };
  console.log(form);
}
</script>