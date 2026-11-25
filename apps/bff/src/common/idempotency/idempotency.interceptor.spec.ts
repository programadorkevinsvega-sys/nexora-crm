import { IdempotencyInterceptor } from './idempotency.interceptor'
import { ExecutionContext, CallHandler, ConflictException } from '@nestjs/common'
import { of, Observable } from 'rxjs'
import type { CacheService } from '../cache/cache.service'

type MockCacheService = jest.Mocked<Pick<CacheService, 'getRaw' | 'setRaw' | 'setNx' | 'del'>>
interface MockResponse {
  statusCode: number
  setHeader: jest.Mock
  status: jest.Mock
}

describe('IdempotencyInterceptor - BFF Gateway REST Tests', () => {
  let interceptor: IdempotencyInterceptor
  let mockCacheService: MockCacheService

  beforeEach(() => {
    mockCacheService = {
      getRaw: jest.fn(),
      setRaw: jest.fn().mockResolvedValue(undefined),
      setNx: jest.fn().mockResolvedValue(true),
      del: jest.fn().mockResolvedValue(undefined),
    } as unknown as MockCacheService
    interceptor = new IdempotencyInterceptor(mockCacheService as unknown as CacheService)
  })

  function createMockContext(method: string, headers: Record<string, string>): { context: ExecutionContext; res: MockResponse } {
    const res: MockResponse = {
      statusCode: 200,
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }
    const req = { method, headers }
    const context = {
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
    } as unknown as ExecutionContext
    return { context, res }
  }

  const readFirstValue = (handler: Observable<unknown>) => new Promise<unknown>((resolve, reject) => {
    handler.subscribe({ next: resolve, error: reject })
  })

  it('bypasses non-mutating GET requests without touching cache', async () => {
    const { context } = createMockContext('GET', { 'idempotency-key': 'key-1' })
    const handler: CallHandler<unknown> = { handle: () => of({ data: 'ok' }) }
    const result = await readFirstValue(await interceptor.intercept(context, handler))
    expect(result).toEqual({ data: 'ok' })
    expect(mockCacheService.getRaw).not.toHaveBeenCalled()
  })

  it('bypasses POST requests without Idempotency-Key header', async () => {
    const { context } = createMockContext('POST', {})
    const handler: CallHandler<unknown> = { handle: () => of({ created: true }) }
    const result = await readFirstValue(await interceptor.intercept(context, handler))
    expect(result).toEqual({ created: true })
    expect(mockCacheService.getRaw).not.toHaveBeenCalled()
  })

  it('returns cached response and sets replay header on cache HIT', async () => {
    mockCacheService.getRaw.mockResolvedValue(JSON.stringify({ statusCode: 201, body: { id: 'c-100' } }))
    const { context, res } = createMockContext('POST', { 'idempotency-key': 'key-abc', 'x-tenant-id': 'tenant-1' })
    const handler: CallHandler<unknown> = { handle: jest.fn() }
    const result = await readFirstValue(await interceptor.intercept(context, handler))
    expect(result).toEqual({ id: 'c-100' })
    expect(res.setHeader).toHaveBeenCalledWith('X-Idempotent-Replay', 'true')
    expect(handler.handle).not.toHaveBeenCalled()
  })

  it('throws ConflictException if concurrent request is IN_FLIGHT', async () => {
    mockCacheService.getRaw.mockResolvedValue(null)
    mockCacheService.setNx.mockResolvedValue(false)
    const { context } = createMockContext('POST', { 'idempotency-key': 'key-conflict' })
    const handler: CallHandler<unknown> = { handle: () => of({ id: 'c-1' }) }
    await expect(interceptor.intercept(context, handler)).rejects.toThrow(ConflictException)
  })

  it('executes fresh mutation, caches response for 24h and releases lock', async () => {
    mockCacheService.getRaw.mockResolvedValue(null)
    mockCacheService.setNx.mockResolvedValue(true)
    const { context } = createMockContext('POST', { 'idempotency-key': 'key-new', 'x-tenant-id': 'tenant-1' })
    const handler: CallHandler<unknown> = { handle: () => of({ id: 'c-new', name: 'Created' }) }
    const result = await readFirstValue(await interceptor.intercept(context, handler))
    expect(result).toEqual({ id: 'c-new', name: 'Created' })
    expect(mockCacheService.setRaw).toHaveBeenCalledWith(
      'idempotency:tenant-1:key-new', expect.stringContaining('c-new'), 86400,
    )
    expect(mockCacheService.del).toHaveBeenCalledWith('idempotency:lock:tenant-1:key-new')
  })
})