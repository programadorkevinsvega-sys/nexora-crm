import { ExecutionContext, ForbiddenException, HttpException, UnauthorizedException } from '@nestjs/common'
import { createHmac } from 'crypto'
import { Reflector } from '@nestjs/core'
import { BffJwtAuthGuard } from '../guards/jwt-auth.guard'
import { AdminOnlyGuard } from '../guards/admin-only.guard'
import { ScopeGuard } from '../guards/scope.guard'
import { RateLimiterGuard } from '../guards/rate-limiter.guard'
import { SecurityHeadersMiddleware } from '../middleware/security-headers.middleware'
import { REQUIRED_SCOPE_KEY } from '../decorators/require-scope.decorator'
import { THROTTLE_LIMIT_KEY, THROTTLE_TTL_KEY } from '../decorators/throttle.decorator'

const JWT_SECRET = 'test-secret'

const signTestJwt = (payload: any, secret = JWT_SECRET): string => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, ...payload })).toString('base64url')
  const signature = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

const createMockExecutionContext = (req: any, res: any = {}): ExecutionContext => ({
  getType: () => 'http',
  getHandler: () => ({}),
  getClass: () => ({}),
  switchToHttp: () => ({
    getRequest: () => req,
    getResponse: () => res,
  }),
} as any)

describe('F5.1 — Multi-Tenant Isolation & Security Authorization Suite', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET
  })

  afterAll(() => {
    delete process.env.JWT_SECRET
  })

  describe('1. Anti-IDOR & Header Spoofing Protection', () => {
    const reflector = new Reflector()
    const guard = new BffJwtAuthGuard(reflector)

    it('neutralizes spoofed X-Tenant-Id and X-User-Id, strictly enforcing token claims', () => {
      const legitTenant = '00000000-0000-0000-0000-000000000001'
      const attackerTenant = '99999999-9999-9999-9999-999999999999'
      const legitUser = '11111111-1111-1111-1111-111111111111'
      const spoofedAdmin = '22222222-2222-2222-2222-222222222222'

      const token = signTestJwt({ sub: legitUser, tenantId: legitTenant, role: 'agent' })
      const req: any = {
        path: '/api/contacts',
        headers: {
          authorization: `Bearer ${token}`,
          'x-tenant-id': attackerTenant,
          'x-user-id': spoofedAdmin,
          'x-user-role': 'superadmin',
        },
      }

      const allowed = guard.canActivate(createMockExecutionContext(req))

      expect(allowed).toBe(true)
      expect(req.tenantId).toBe(legitTenant)
      expect(req.userId).toBe(legitUser)
      expect(req.headers['x-tenant-id']).toBe(legitTenant)
      expect(req.headers['x-user-id']).toBe(legitUser)
      expect(req.headers['x-user-role']).toBe('agent')
      expect(req.user.role).toBe('agent')
    })
  })

  describe('2. JWT Cryptographic Signature & Expiry Enforcement', () => {
    const reflector = new Reflector()
    const guard = new BffJwtAuthGuard(reflector)

    it('rejects tokens signed with invalid secret key', () => {
      const forgedToken = signTestJwt({ sub: 'u1', tenantId: 't1' }, 'wrong-secret-key-attacker')
      const req = { path: '/api/contacts', headers: { authorization: `Bearer ${forgedToken}` } }

      expect(() => guard.canActivate(createMockExecutionContext(req))).toThrow(UnauthorizedException)
    })

    it('rejects expired tokens immediately', () => {
      const expiredToken = signTestJwt({ sub: 'u1', tenantId: 't1', exp: Math.floor(Date.now() / 1000) - 100 })
      const req = { path: '/api/contacts', headers: { authorization: `Bearer ${expiredToken}` } }

      expect(() => guard.canActivate(createMockExecutionContext(req))).toThrow(UnauthorizedException)
    })
  })

  describe('3. RBAC Matrix Protection (AdminOnlyGuard)', () => {
    const adminGuard = new AdminOnlyGuard()

    it('blocks agents and viewers with 403 Forbidden', () => {
      const agentCtx = createMockExecutionContext({ user: { role: 'agent' } })
      const viewerCtx = createMockExecutionContext({ user: { roles: ['viewer'] } })

      expect(() => adminGuard.canActivate(agentCtx)).toThrow(ForbiddenException)
      expect(() => adminGuard.canActivate(viewerCtx)).toThrow(ForbiddenException)
    })

    it('grants access to admin and workspace owner roles', () => {
      const adminCtx = createMockExecutionContext({ user: { role: 'admin' } })
      const ownerCtx = createMockExecutionContext({ user: { role: 'owner' } })

      expect(adminGuard.canActivate(adminCtx)).toBe(true)
      expect(adminGuard.canActivate(ownerCtx)).toBe(true)
    })
  })

  describe('4. Scope-Based Authorization Matrix (ScopeGuard)', () => {
    it('blocks API key lacking required scope', () => {
      const reflector = { getAllAndOverride: jest.fn().mockImplementation((k) => (k === REQUIRED_SCOPE_KEY ? 'contacts:write' : undefined)) } as any
      const scopeGuard = new ScopeGuard(reflector)
      const context = createMockExecutionContext({ apiKeyContext: { scopes: ['contacts:read'] } })

      expect(() => scopeGuard.canActivate(context)).toThrow(ForbiddenException)
    })

    it('allows API key with matching scope', () => {
      const reflector = { getAllAndOverride: jest.fn().mockImplementation((k) => (k === REQUIRED_SCOPE_KEY ? 'contacts:write' : undefined)) } as any
      const scopeGuard = new ScopeGuard(reflector)
      const context = createMockExecutionContext({ apiKeyContext: { scopes: ['contacts:read', 'contacts:write'] } })

      expect(scopeGuard.canActivate(context)).toBe(true)
    })
  })

  describe('5. Rate Limiting Protection (RateLimiterGuard)', () => {
    it('enforces 429 Too Many Requests when limit exceeded', async () => {
      const reflector = { getAllAndOverride: jest.fn().mockImplementation((k) => (k === THROTTLE_LIMIT_KEY ? 5 : k === THROTTLE_TTL_KEY ? 60 : undefined)) } as any
      const cache = { increment: jest.fn().mockResolvedValue(6) } as any
      const rateGuard = new RateLimiterGuard(reflector, cache)
      const response = { setHeader: jest.fn() }
      const context = createMockExecutionContext({ ip: '1.2.3.4' }, response)

      await expect(rateGuard.canActivate(context)).rejects.toThrow(HttpException)
      expect(response.setHeader).toHaveBeenCalledWith('Retry-After', '60')
    })
  })

  describe('6. Security Headers Hardening Middleware', () => {
    const middleware = new SecurityHeadersMiddleware()

    it('injects all required defensive HTTP headers', () => {
      const headers: Record<string, string> = {}
      const res = { setHeader: jest.fn((k, v) => { headers[k] = v }), removeHeader: jest.fn((k) => { delete headers[k] }) } as any
      middleware.use({ path: '/api/contacts' } as any, res, jest.fn())

      expect(headers['X-Content-Type-Options']).toBe('nosniff')
      expect(headers['Strict-Transport-Security']).toContain('max-age=31536000')
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
      expect(res.removeHeader).toHaveBeenCalledWith('X-Powered-By')
    })
  })
})
