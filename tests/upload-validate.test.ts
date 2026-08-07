import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildUploadKey,
  checkUploadKey,
  validateUploadFilename,
} from '../server/utils/uploadValidate'

test('validateUploadFilename 放行合法文件名', () => {
  assert.equal(validateUploadFilename('app-1.0.0.exe'), true)
  assert.equal(validateUploadFilename('latest.yml'), true)
  assert.equal(validateUploadFilename('update_2026.blockmap'), true)
})

test('validateUploadFilename 拒绝路径穿越与非法字符', () => {
  assert.equal(validateUploadFilename(''), false)
  assert.equal(validateUploadFilename('a/../b.exe'), false)
  assert.equal(validateUploadFilename('a\\b.exe'), false)
  assert.equal(validateUploadFilename('a b.exe'), false)
  assert.equal(validateUploadFilename('../etc/passwd'), false)
})

test('buildUploadKey 按环境前缀+固定目录+原文件名拼接', () => {
  assert.equal(
    buildUploadKey('stage', 'electron_resource', 'latest.yml'),
    'blog_data_stage/electron_resource/latest.yml'
  )
})

test('checkUploadKey 只有完全匹配才通过', () => {
  assert.equal(checkUploadKey('secret123', 'secret123'), true)
  assert.equal(checkUploadKey('wrong', 'secret123'), false)
  assert.equal(checkUploadKey(undefined, 'secret123'), false)
  assert.equal(checkUploadKey('secret123', undefined), false)
})
