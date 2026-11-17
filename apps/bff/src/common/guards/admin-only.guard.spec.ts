import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common'
import { AdminOnlyGuard } from './admin-only.guard'

const createMockContext = (user?: any): ExecutionContext => ({
  switchToHttp: () => ({
    getRequest: () => ({ user }),
  }),
} as any)

describe('AdminOnlyGuard', () => {
  const guard = new AdminOnlyGuard()

  it('throws UnauthorizedException if user is not authenticated', () => {
    expect(() => guard.canActivate(createMockContext(undefined))).toThrow(UnauthorizedException)
  })

  it('throws ForbiddenException if user has non-admin role (e.g. agent)', () => {
    const user = { sub: 'u-1', tenantId: 't-1', role: 'agent' }
    expect(() => guard.canActivate(createMockContext(user))).toThrow(ForbiddenException)
  })

  it('throws ForbiddenException if user has only non-admin roles in array', () => {
    const user = { sub: 'u-1', tenantId: 't-1', roles: ['agent', 'viewer'] }
    expect(() => guard.canActivate(createMockContext(user))).toThrow(ForbiddenException)
  })

  it('allows access if user has admin role', () => {
    const user = { sub: 'u-1', tenantId: 't-1', role: 'admin' }
    expect(guard.canActivate(createMockContext(user))).toBe(true)
  })

  it('allows access if user has owner role', () => {
    const user = { sub: 'u-1', tenantId: 't-1', role: 'owner' }
    expect(guard.canActivate(createMockContext(user))).toBe(true)
  })

  it('allows access if user has admin role in roles array', () => {
    const user = { sub: 'u-1', tenantId: 't-1', roles: ['support', 'admin'] }
    expect(guard.canActivate(createMockContext(user))).toBe(true)
  })
})
