import { z, ZodTypeAny } from 'zod'

export function zodToJsonSchema(schema: ZodTypeAny): Record<string, unknown> {
  if (!(schema instanceof z.ZodObject)) {
    throw new TypeError('MCP tool input schemas must be Zod objects')
  }

  const properties: Record<string, unknown> = {}
  const required: string[] = []

  for (const [key, value] of Object.entries(schema.shape) as Array<[string, ZodTypeAny]>) {
    properties[key] = convertZodField(value)
    if (!value.isOptional() && !value.isNullable()) {
      required.push(key)
    }
  }

  return {
    type: 'object',
    properties,
    ...(required.length > 0 ? { required } : {}),
  }
}

function convertZodField(field: ZodTypeAny): Record<string, unknown> {
  const description = field.description
  let inner = field

  while (inner instanceof z.ZodOptional || inner instanceof z.ZodNullable) {
    inner = inner.unwrap()
  }

  if (inner instanceof z.ZodString) {
    return { type: 'string', ...(description ? { description } : {}) }
  }
  if (inner instanceof z.ZodNumber) {
    return { type: 'number', ...(description ? { description } : {}) }
  }
  if (inner instanceof z.ZodBoolean) {
    return { type: 'boolean', ...(description ? { description } : {}) }
  }
  if (inner instanceof z.ZodEnum) {
    return {
      type: 'string',
      enum: inner.options,
      ...(description ? { description } : {}),
    }
  }
  if (inner instanceof z.ZodArray) {
    return {
      type: 'array',
      items: convertZodField(inner.element),
      ...(description ? { description } : {}),
    }
  }
  if (inner instanceof z.ZodObject) {
    return zodToJsonSchema(inner)
  }

  return { type: 'string', ...(description ? { description } : {}) }
}
