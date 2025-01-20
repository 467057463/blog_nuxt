import type { H3Event } from 'h3'
import type { ZodType } from 'zod';
import { z } from 'zod'

export async function readValidateFormData (event:H3Event, schema: ZodType): Promise<z.infer<typeof schema>> {
  const multi = await readMultipartFormData(event);
  const multiData = multi?.reduce((prev, item) => {
    const { name, ...data} = item;
    return {
      ...prev,
      [name!]: data.filename ? data : data.data.toString()
    }
  }, {});
  return schema.parse(multiData)
}