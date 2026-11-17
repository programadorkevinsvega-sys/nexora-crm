import { RedisCacheAdapter } from '../redis-cache.adapter'
import { ICachePort } from '@crm/shared'

describe('RedisCacheAdapter', () => {
  let adapter: RedisCacheAdapter

  beforeEach(() => {
    adapter = new RedisCacheAdapter()
  })

  it('should implement ICachePort abstraction', () => {
    expect(adapter).toBeInstanceOf(ICachePort)
  })

  it('should return null on get when redis is not ready (graceful fallback)', async () => {
    const result = await adapter.get('test:key')
    expect(result).toBeNull()
  })

  it('should execute factory directly on getOrSet when redis is not ready', async () => {
    const factory = jest.fn().mockResolvedValue({ id: '123', name: 'Demo' })
    const result = await adapter.getOrSet('test:key', factory, 60)

    expect(factory).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ id: '123', name: 'Demo' })
  })

  it('should acquireLock safely returning true when redis is not ready', async () => {
    const lockAcquired = await adapter.acquireLock('my-resource', 1000)
    expect(lockAcquired).toBe(true)
  })
})
