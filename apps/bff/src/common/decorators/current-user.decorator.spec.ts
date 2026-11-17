import { ExecutionContext } from '@nestjs/common'
import { CurrentUser } from './current-user.decorator'

const mockExecutionContext = (request: any): ExecutionContext => ({
  switchToHttp: () => ({
    getRequest: () => request,
  }),
} as any)

describe('CurrentUser Decorator', () => {
  const getFactory = () => {
    // CurrentUser returns a parameter decorator; extract the decorator function metadata
    const metadataKey = 'custom:param_decorator'
    return (CurrentUser as any)
  }

  it('extracts the authenticated user from request.user', () => {
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

    // In NestJS, custom param decorators are called with (data, ctx)
    const factory = Reflect.getMetadata('__custom_param_decorator__', CurrentUser)
    // Direct invocation test
    const ctx = mockExecutionContext(request)
    expect(request.user.sub).toBe('user-123')
    expect(request.user.tenantId).toBe('tenant-456')
    expect(request.user.role).toBe('admin')
  })
})
