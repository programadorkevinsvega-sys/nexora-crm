import { ExecutionContext } from '@nestjs/common'
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants'
import { AuthenticatedUser, CurrentUser } from './current-user.decorator'

interface CustomParameterMetadata {
  factory: (data: keyof AuthenticatedUser | undefined, context: ExecutionContext) => unknown
}

function createExecutionContext(request: { user?: Record<string, unknown> }): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext
}

describe('CurrentUser Decorator', () => {
  it('extracts the authenticated user from request.user and ignores spoofed headers', () => {
    class TestController {
      handle(@CurrentUser() _user: AuthenticatedUser): void {}
    }

    const metadata = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      TestController,
      'handle',
    ) as Record<string, CustomParameterMetadata> | undefined
    const parameterMetadata = metadata && Object.values(metadata)[0]

    expect(parameterMetadata).toBeDefined()

    const request = {
      user: {
        sub: 'user-123',
        tenantId: 'tenant-456',
        role: 'admin',
        email: 'user@example.com',
      },
      headers: {
        'x-user-id': 'attacker-user',
        'x-user-role': 'super-admin',
      },
    }
    const user = parameterMetadata?.factory(undefined, createExecutionContext(request)) as AuthenticatedUser

    expect(user.userId).toBe('user-123')
    expect(user.sub).toBe('user-123')
    expect(user.tenantId).toBe('tenant-456')
    expect(user.role).toBe('admin')
    expect(user.email).toBe('user@example.com')
  })
})
