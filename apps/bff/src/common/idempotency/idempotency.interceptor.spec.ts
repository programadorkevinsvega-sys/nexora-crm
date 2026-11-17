import { IdempotencyInterceptor } from './idempotency.interceptor'
import { ExecutionContext, CallHandler, ConflictException } from '@nestjs/common'
import { of, throwError } from 'rxjs'

describe('IdempotencyInterceptor - BFF Gateway REST Tests', () => {
  let interceptor: IdempotencyInterceptor
  let mockCacheService: any

  beforeEach(() => {
    mockCacheService = {
      getRaw: jest.fn(),
      setRaw: jest.fn().mockResolvedValue(undefined),
      setNx: jest.fn().mockResolvedValue(true),
      del: jest.fn().mockResolvedValue(undefined),
    }

    interceptor = new IdempotencyInterceptor(mockCacheService)
  })

  function createMockContext(method: string, headers: Record<string, string>): { context: ExecutionContext; res: any } {
    const res = {
      statusCode: 200,
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }
    const req = {
      method,
      headers,
    }

    const context = {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
    } as unknown as ExecutionContext

    return { context, res }
  }

  it('should bypass non-mutating GET requests without touching cache', async () => {
    const { context } = createMockContext('GET', { 'idempotency-key': 'key-1' })
    const handler: CallHandler = { handle: () => of({ data: 'ok' }) }

    const result$ = await interceptor.intercept(context, handler)
    const result = await new Promise((resolve) => result$.subscribe(resolve))

    expect(result).toEqual({ data: 'ok' })
    expect(mockCacheService.getRaw).not.toHaveBeenCalled()
  })

  it('should bypass POST requests without Idempotency-Key header', async () => {
    const { context } = createMockContext('POST', {})
    const handler: CallHandler = { handle: () => of({ created: true }) }

    const result$ = await interceptor.intercept(context, handler)
    const result = await new Promise((resolve) => result$.subscribe(resolve))

    expect(result).toEqual({ created: true })
    expect(mockCacheService.getRaw).not.toHaveBeenCalled()
  })

  it('should return cached response and set X-Idempotent-Replay header on cache HIT', async () => {
    mockCacheService.getRaw.mockResolvedValue(JSON.stringify({ statusCode: 201, body: { id: 'c-100' } }))
    const { context, res } = createMockContext('POST', { 'idempotency-key': 'key-abc', 'x-tenant-id': 'tenant-1' })
    const handler: CallHandler = { handle: jest.fn() }

    const result$ = await interceptor.intercept(context, handler)
    const result = await new Promise((resolve) => result$.subscribe(resolve))

    expect(result).toEqual({ id: 'c-100' })
    expect(res.setHeader).toHaveBeenCalledWith('X-Idempotent-Replay', 'true')
    expect(handler.handle).not.toHaveBeenCalled()
  })

  it('should throw ConflictException if concurrent request is IN_FLIGHT', async () => {
    mockCacheService.getRaw.mockResolvedValue(null)
    mockCacheService.setNx.mockResolvedValue(false) // Lock rejected
    const { context } = createMockContext('POST', { 'idempotency-key': 'key-conflict' })
    const handler: CallHandler = { handle: () => of({ id: 'c-1' }) }

    await expect(interceptor.intercept(context, handler)).rejects.toThrow(ConflictException)
  })

  it('should execute fresh mutation, cache response for 24h, and release in-flight lock', async () => {
    mockCacheService.getRaw.mockResolvedValue(null)
    mockCacheService.setNx.mockResolvedValue(true)
    const { context } = createMockContext('POST', { 'idempotency-key': 'key-new', 'x-tenant-id': 'tenant-1' })
    const handler: CallHandler = { handle: () => of({ id: 'c-new', name: 'Created' }) }

    const result$ = await interceptor.intercept(context, handler)
    const result = await new Promise((resolve) => result$.subscribe(resolve))

    expect(result).toEqual({ id: 'c-new', name: 'Created' })
    expect(mockCacheService.setRaw).toHaveBeenCalledWith(
      'idempotency:tenant-1:key-new',
      expect.stringContaining('c-new'),
      86400,
    )
    expect(mockCacheService.del).toHaveBeenCalledWith('idempotency:lock:tenant-1:key-new')
  })
})
