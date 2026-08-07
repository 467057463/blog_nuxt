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
  {
    // CommonJS 配置文件（pm2 ecosystem）使用 node 全局，需显式声明避免 no-undef 误报。
    files: ['**/*.cjs'],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
      },
    },
  },
)
