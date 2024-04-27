<template>
  <div>login</div>
  <el-form @submit.prevent ref="$form" :model="form" :rules="rules">
    <el-form-item label="用户名" prop="name">
      <el-input v-model="form.name"/>
    </el-form-item>

    <el-form-item label="密码">
      <el-input v-model="form.password" type="password"/>
    </el-form-item>
    <el-button @click="handleLogin" native-type="submit">登录</el-button>
  </el-form>
</template>

<script setup lang="ts">
const $form = ref('');
const rules = reactive({
  name: [
    { required: true, message: 'Please input Activity name', trigger: 'blur' },
    { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' },
  ]
});
const form = reactive({
  name: '',
  password: ''
});

async function handleLogin(){
  try {
    await $form.value.validate();
  } catch (error) {
    console.error(error);
  };
  console.log(form);
}
</script>