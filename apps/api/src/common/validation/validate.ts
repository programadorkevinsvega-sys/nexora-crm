import { BadRequestException } from '@nestjs/common'
import { ZodSchema } from 'zod'

export function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new BadRequestException({
      error: 'validation_error',
      details: result.error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    })
  }
  return result.data
}
