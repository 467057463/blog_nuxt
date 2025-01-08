import svgCaptcha from 'svg-captcha';
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
  const captcha = svgCaptcha.create();
  const uuid = uuidv4()
  await captchaStorage.setItem(uuid, captcha.text)

  return {
    code: 200,
    data: {
      captcha: captcha.data,
      uuid
    },
    message: 'success'
  }
})