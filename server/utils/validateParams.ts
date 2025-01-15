import type { H3Event } from 'h3'
import type { ZodType } from 'zod';
import { z } from 'zod'
import { ApiErrorMap } from '~/constant/ApiErrorMap';

export async function validateBodyParams(event:H3Event, schema: ZodType) : Promise<z.infer<typeof schema>>{
  const body = await readBody(event);
  let res = schema.safeParse(body);

  if(!res.success){
    return res.data
  } else {
    throw createError({
      statusCode: 400,
      message: ApiErrorMap[100000]
    })
  }
  try {
    return res;
  } catch (error) {
    if(error instanceof z.ZodError){
      throw createError({
        statusCode: 400,
        // data: error.issues.reduce((prev, item) => {
        //   return {
        //     ...prev,
        //     [item.path[0]]: item.message
        //   }
        // }, {}),
        message: ApiErrorMap[100000]
      })
    }
  }
}