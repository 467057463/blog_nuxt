import prisma from "~/lib/prisma";
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  const { username, password, code, uuid } = await readBody(event);

  // 图形验证码验证
  const captchaCode = await captchaStorage.getItem(uuid) as string;
  if(!captchaCode || captchaCode.toLowerCase() !== code.toLowerCase()){
    return {
      code: 100002,
      message: 'invalid captcha.',
      data: null
    }
  }

  const user = await prisma.user.findUnique({
    where: {
      username
    }
  })

  // 验证 用户名/密码 是否正确
  if(!user || !await verifyPassword(user.password, password)){
    return {
      code: 100001,
      message: 'Invalid username or password',
      data: null
    }
  }

  
  // 生成 jwt token
  const runtimeConfig = useRuntimeConfig();
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username
    },
    runtimeConfig.jwtSecert,
    {
      expiresIn: '30d'
    }
  )

  await setUserSession(event, {
    // user: {
    //   id: user.id,
    // },
    token,
    loggedInAt: Date.now()
  })
  
  return {
    code: 0,
    data: {
      token 
    },
    message: 'login success'
  }
})