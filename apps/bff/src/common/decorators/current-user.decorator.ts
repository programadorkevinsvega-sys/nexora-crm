import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface AuthenticatedUser {
  userId: string
  sub: string
  tenantId: string
  email?: string
  role?: string
  roles?: string[]
  customerPortal?: boolean
  contactId?: string
  [key: string]: unknown
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user: AuthenticatedUser | undefined = request.user
      ? {
          userId: request.user.sub || request.user.userId,
          sub: request.user.sub || request.user.userId,
          tenantId: request.user.tenantId,
          email: request.user.email,
          role: request.user.role,
          roles: request.user.roles,
          customerPortal: request.user.customerPortal === true,
          contactId: request.user.contactId,
        }
      : undefined

    if (!user) return undefined
    return data ? user[data] : user
  },
)
