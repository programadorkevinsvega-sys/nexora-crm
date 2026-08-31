import { z, ZodTypeAny, ZodObject } from 'zod'

export function zodToJsonSchema(schema: ZodObject<any>): Record<string, unknown> {
  const shape = schema.shape
  const properties: Record<string, unknown> = {}
  const required: string[] = []

  for (const [key, value] of Object.entries(shape) as [string, ZodTypeAny][]) {
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
  const desc = field.description

  // Unwrap optional or nullable
  let inner = field
  while ('unwrap' in inner && typeof (inner as any).unwrap === 'function') {
    inner = (inner as any).unwrap()
  }

  const typeName = inner._def?.typeName

  if (typeName === 'ZodString') {
    return { type: 'string', ...(desc ? { description: desc } : {}) }
  }
  if (typeName === 'ZodNumber') {
    return { type: 'number', ...(desc ? { description: desc } : {}) }
  }
  if (typeName === 'ZodBoolean') {
    return { type: 'boolean', ...(desc ? { description: desc } : {}) }
  }
  if (typeName === 'ZodEnum') {
    return {
      type: 'string',
      enum: inner._def.values,
      ...(desc ? { description: desc } : {}),
    }
  }
  if (typeName === 'ZodArray') {
    return {
      type: 'array',
      items: convertZodField(inner._def.type),
      ...(desc ? { description: desc } : {}),
    }
  }
  if (typeName === 'ZodObject') {
    return zodToJsonSchema(inner as ZodObject<any>)
  }

  return { type: 'string', ...(desc ? { description: desc } : {}) }
}
