import svgCaptcha from 'svg-captcha';
import { v4 as uuidv4 } from 'uuid'

export const handle = async () => {
  const captcha = svgCaptcha.create();
  const uuid = uuidv4()
  await captchaStorage.setItem(uuid, captcha.text)

  return {
    captcha: captcha.data,
    uuid
  }
}

export default defineEventHandler( () => {
  return responFormat(handle)
})