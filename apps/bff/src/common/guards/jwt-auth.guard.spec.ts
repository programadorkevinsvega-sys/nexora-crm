import { createHmac } from 'crypto'
import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { BffJwtAuthGuard } from './jwt-auth.guard'

const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url')

const tokenFor = (payload: Record<string, unknown>, secret = 'test-secret') => {
  const header = encode({ alg: 'HS256', typ: 'JWT' })
  const body = encode(payload)
  const signature = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

const contextFor = (request: Record<string, any>, isPublic = false): ExecutionContext => ({
  getType: () => 'http',
  getHandler: () => ({}),
  getClass: () => ({}),
  switchToHttp: () => ({ getRequest: () => request }) as any,
  getArgByIndex: () => undefined,
  getArgs: () => [],
  getCtor: () => undefined,
  getFunction: () => undefined,
  getMetadata: () => undefined,
  getReturnType: () => undefined,
  getClassName: () => undefined,
  getHandlerName: () => undefined,
  getModule: () => undefined,
  getContextId: () => undefined,
  getTypeName: () => undefined,
  getCustomMetadata: () => isPublic,
} as any)

describe('BffJwtAuthGuard', () => {
  const reflector = new Reflector()
  const guard = new BffJwtAuthGuard(reflector)

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret'
  })

  afterAll(() => {
    delete process.env.JWT_SECRET
  })

  it('allows explicitly public routes', () => {
    const request = { path: '/api/v1/contacts', headers: {} }
    expect(guard.canActivate(contextFor(request))).toBe(true)
  })

  it('rejects protected requests without bearer token', () => {
    const request = { path: '/api/contacts', headers: {} }
    expect(() => guard.canActivate(contextFor(request))).toThrow(UnauthorizedException)
  })

  it('accepts a valid token and derives identity headers from claims', () => {
    const token = tokenFor({ sub: 'user-1', tenantId: 'tenant-1', role: 'admin', exp: Math.floor(Date.now() / 1000) + 300 })
    const request = { path: '/api/contacts', headers: { authorization: `Bearer ${token}`, 'x-tenant-id': 'attacker-tenant' } }

    expect(guard.canActivate(contextFor(request))).toBe(true)
    expect(request.tenantId).toBe('tenant-1')
    expect(request.userId).toBe('user-1')
    expect(request.headers['x-tenant-id']).toBe('tenant-1')
    expect(request.headers['x-user-id']).toBe('user-1')
    expect(request.headers['x-user-role']).toBe('admin')
  })

  it('rejects a token with an invalid signature', () => {
    const token = tokenFor({ sub: 'user-1', tenantId: 'tenant-1', exp: Math.floor(Date.now() / 1000) + 300 })
    const request = { path: '/api/contacts', headers: { authorization: `Bearer ${token.slice(0, -1)}x` } }
    expect(() => guard.canActivate(contextFor(request))).toThrow(UnauthorizedException)
  })
})
