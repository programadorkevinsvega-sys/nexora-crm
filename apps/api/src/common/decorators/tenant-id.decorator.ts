import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common'

export const TenantId = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest()
  return request.tenantId
})

export const UserId = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest()
  return request.userId
})

export const Public = () => SetMetadata('isPublic', true)
