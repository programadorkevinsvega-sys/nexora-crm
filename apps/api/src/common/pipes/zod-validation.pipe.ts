import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common'
import { ZodSchema, ZodError } from 'zod'

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema?: ZodSchema) {}

  transform(value: unknown) {
    if (!this.schema) return value

    const result = this.schema.safeParse(value)
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
}

export function createZodPipe<T>(schema: ZodSchema<T>): PipeTransform<T> {
  return {
    transform(value: unknown) {
      const result = schema.safeParse(value)
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
    },
  }
}
