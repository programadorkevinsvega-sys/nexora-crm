import { RedisCacheAdapter } from '../redis-cache.adapter'

describe('Redis Cache Adapter & Distributed Locking Integration', () => {
  let cacheAdapter: RedisCacheAdapter
  let mockRedisClient: any

  beforeEach(() => {
    mockRedisClient = {
      get: jest.fn(),
      setex: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      scan: jest.fn().mockResolvedValue(['0', ['crm:contacts:123', 'crm:contacts:456']]),
      set: jest.fn().mockResolvedValue('OK'),
      quit: jest.fn().mockResolvedValue('OK'),
      connect: jest.fn().mockResolvedValue(undefined),
      on: jest.fn((event, cb) => {
        if (event === 'ready') cb()
      }),
    }

    cacheAdapter = new RedisCacheAdapter()
    ;(cacheAdapter as any).redis = mockRedisClient
    ;(cacheAdapter as any).redisReady = true
  })

  it('should get cached JSON payload on cache hit', async () => {
    mockRedisClient.get.mockResolvedValue(JSON.stringify({ id: 'c-1', name: 'Acme' }))

    const result = await cacheAdapter.get<{ id: string; name: string }>('crm:company:c-1')

    expect(result).toEqual({ id: 'c-1', name: 'Acme' })
    expect(mockRedisClient.get).toHaveBeenCalledWith('crm:company:c-1')
  })

  it('should execute factory function on cache miss and cache result', async () => {
    mockRedisClient.get.mockResolvedValue(null)
    const factory = jest.fn().mockResolvedValue({ id: 'fresh-1' })

    const result = await cacheAdapter.getOrSet('crm:test:fresh', factory, 600)

    expect(result).toEqual({ id: 'fresh-1' })
    expect(factory).toHaveBeenCalledTimes(1)
    expect(mockRedisClient.setex).toHaveBeenCalledWith('crm:test:fresh', 600, JSON.stringify({ id: 'fresh-1' }))
  })

  it('should acquire distributed lock with NX and PX TTL', async () => {
    mockRedisClient.set.mockResolvedValue('OK')

    const acquired = await cacheAdapter.acquireLock('order:checkout:100', 3000)

    expect(acquired).toBe(true)
    expect(mockRedisClient.set).toHaveBeenCalledWith('lock:order:checkout:100', 'locked', 'PX', 3000, 'NX')
  })

  it('should reject second concurrent lock acquisition', async () => {
    mockRedisClient.set.mockResolvedValue(null)

    const acquired = await cacheAdapter.acquireLock('order:checkout:100', 3000)

    expect(acquired).toBe(false)
  })

  it('should invalidate cache keys matching pattern via SCAN', async () => {
    await cacheAdapter.deletePattern('contacts')

    expect(mockRedisClient.scan).toHaveBeenCalled()
    expect(mockRedisClient.del).toHaveBeenCalledWith('crm:contacts:123', 'crm:contacts:456')
  })
})
