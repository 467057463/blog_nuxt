import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '.nuxt/**',
      '.output/**',
      'generated/**',
      'node_modules/**',
      'code-reviews/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      // TypeScript 已负责名称解析，关闭基础规则可避免把 Nuxt 自动导入误判为未定义。
      'no-undef': 'off',
    },
  },
)
