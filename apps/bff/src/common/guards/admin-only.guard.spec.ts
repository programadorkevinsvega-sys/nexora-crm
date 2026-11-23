import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common'
import { AdminOnlyGuard } from './admin-only.guard'

interface MockUser {
  sub: string
  tenantId: string
  role?: string
  roles?: string[]
}

const createMockContext = (user?: MockUser): ExecutionContext => ({
  switchToHttp: () => ({ getRequest: () => ({ user }) }),
} as unknown as ExecutionContext)

describe('AdminOnlyGuard', () => {
  const guard = new AdminOnlyGuard()

  it('throws UnauthorizedException if user is not authenticated', () => {
    expect(() => guard.canActivate(createMockContext(undefined))).toThrow(UnauthorizedException)
  })
  it('throws ForbiddenException if user has non-admin role (e.g. agent)', () => {
    expect(() => guard.canActivate(createMockContext({ sub: 'u-1', tenantId: 't-1', role: 'agent' }))).toThrow(ForbiddenException)
  })
  it('throws ForbiddenException if user has only non-admin roles in array', () => {
    expect(() => guard.canActivate(createMockContext({ sub: 'u-1', tenantId: 't-1', roles: ['agent', 'viewer'] }))).toThrow(ForbiddenException)
  })
  it('allows access if user has admin role', () => {
    expect(guard.canActivate(createMockContext({ sub: 'u-1', tenantId: 't-1', role: 'admin' }))).toBe(true)
  })
  it('allows access if user has owner role', () => {
    expect(guard.canActivate(createMockContext({ sub: 'u-1', tenantId: 't-1', role: 'owner' }))).toBe(true)
  })
  it('allows access if user has admin role in roles array', () => {
    expect(guard.canActivate(createMockContext({ sub: 'u-1', tenantId: 't-1', roles: ['support', 'admin'] }))).toBe(true)
  })
})