import jwt from 'jsonwebtoken'
import prisma from '~/lib/prisma';
import type { H3Event } from 'h3'


export const useRquestUser = async(event: H3Event, opts: { statusCode?: number, message?: string } = {}) => {
  const runtimeConfig = useRuntimeConfig();
  const authHeader = getHeader(event, 'authorization');

  if(!authHeader){
    throw createError({
      statusCode: opts.statusCode || 401,
      message: opts.message || 'Unauthorized',
    })
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, runtimeConfig.jwtSecert);
  const user = await prisma.user.findUnique({ 
    where: { 
      id: decoded.id 
    } 
  })
  if(!user){
    throw createError({
      statusCode: opts.statusCode || 401,
      message: opts.message || 'Unauthorized',
    })
  }
  const {password, ...res} = user;

  return res;
}