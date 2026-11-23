import { ExecutionContext, HttpException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { CacheService } from '../cache/cache.service'
import { RateLimiterGuard } from './rate-limiter.guard'
import { THROTTLE_LIMIT_KEY, THROTTLE_TTL_KEY } from '../decorators/throttle.decorator'

describe('RateLimiterGuard', () => {
  let guard: RateLimiterGuard
  let mockReflector: { getAllAndOverride: jest.Mock }
  let mockCache: { increment: jest.Mock }

  const createMockContext = (req: Record<string, unknown> = {}, res: Record<string, unknown> = {}): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {},
        ip: '127.0.0.1',
        ...req,
      }),
      getResponse: () => ({
        setHeader: jest.fn(),
        ...res,
      }),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext)

  beforeEach(() => {
    mockReflector = { getAllAndOverride: jest.fn() }
    mockCache = { increment: jest.fn() }
    guard = new RateLimiterGuard(mockReflector as unknown as Reflector, mockCache as unknown as CacheService)
  })

  it('allows request within rate limit', async () => {
    mockReflector.getAllAndOverride.mockImplementation((key) => {
      if (key === THROTTLE_LIMIT_KEY) return undefined
      if (key === THROTTLE_TTL_KEY) return undefined
      return undefined
    })
    mockCache.increment.mockResolvedValue(5)

    const response = { setHeader: jest.fn() }
    const result = await guard.canActivate(createMockContext({}, response))

    expect(result).toBe(true)
    expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '120')
    expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '115')
  })

  it('throws 429 TooManyRequests when limit is exceeded', async () => {
    mockReflector.getAllAndOverride.mockImplementation((key) => {
      if (key === THROTTLE_LIMIT_KEY) return 10
      if (key === THROTTLE_TTL_KEY) return 60
      return undefined
    })
    mockCache.increment.mockResolvedValue(11) // 11th request

    const response = { setHeader: jest.fn() }

    await expect(guard.canActivate(createMockContext({}, response))).rejects.toThrow(HttpException)
    expect(response.setHeader).toHaveBeenCalledWith('Retry-After', '60')
  })

  it('uses custom @Throttle decorator limits when provided', async () => {
    mockReflector.getAllAndOverride.mockImplementation((key) => {
      if (key === THROTTLE_LIMIT_KEY) return 5
      if (key === THROTTLE_TTL_KEY) return 30
      return undefined
    })
    mockCache.increment.mockResolvedValue(3)

    const response = { setHeader: jest.fn() }
    const result = await guard.canActivate(createMockContext({}, response))

    expect(result).toBe(true)
    expect(mockCache.increment).toHaveBeenCalledWith(expect.stringContaining('rate:limit:'), 30)
    expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '5')
    expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '2')
  })

  it('uses in-memory fallback when Redis returns 0 (offline)', async () => {
    mockReflector.getAllAndOverride.mockImplementation((key) => {
      if (key === THROTTLE_LIMIT_KEY) return 2
      if (key === THROTTLE_TTL_KEY) return 60
      return undefined
    })
    mockCache.increment.mockResolvedValue(0) // Redis failure

    const response = { setHeader: jest.fn() }

    // First attempt in memory -> count = 1 -> OK
    expect(await guard.canActivate(createMockContext({ ip: '1.2.3.4' }, response))).toBe(true)

    // Second attempt in memory -> count = 2 -> OK
    expect(await guard.canActivate(createMockContext({ ip: '1.2.3.4' }, response))).toBe(true)

    // Third attempt in memory -> count = 3 -> Exceeded
    await expect(guard.canActivate(createMockContext({ ip: '1.2.3.4' }, response))).rejects.toThrow(HttpException)
  })
})
