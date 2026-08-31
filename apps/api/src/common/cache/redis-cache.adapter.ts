import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import Redis from 'ioredis'
import { ICachePort } from '@crm/shared'

@Injectable()
export class RedisCacheAdapter extends ICachePort implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheAdapter.name)
  private redis: Redis | null = null
  private redisReady = false

  async onModuleInit(): Promise<void> {
    const redisUrl = process.env.REDIS_URL
    if (!redisUrl) {
      this.logger.warn('REDIS_URL not configured. Cache operates in no-op fallback mode.')
      return
    }

    try {
      this.redis = new Redis(redisUrl, {
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 2,
      })

      this.redis.on('ready', () => {
        this.redisReady = true
        this.logger.log('Connected to Redis')
      })

      this.redis.on('error', (err: Error) => {
        this.redisReady = false
        this.logger.warn(`Redis connection error: ${err.message}`)
      })

      await this.redis.connect()
    } catch (err) {
      this.redisReady = false
      this.logger.warn(`Failed initial Redis connection: ${(err as Error).message}`)
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.quit()
      } catch {
        this.redis.disconnect()
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isReady()) return null
    try {
      const raw = await this.redis!.get(key)
      if (!raw) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    if (!this.isReady()) return
    try {
      const serialized = JSON.stringify(value)
      await this.redis!.setex(key, ttlSeconds, serialized)
    } catch (err) {
      this.logger.warn(`Failed to set cache key "${key}": ${(err as Error).message}`)
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isReady()) return
    try {
      await this.redis!.del(key)
    } catch (err) {
      this.logger.warn(`Failed to delete cache key "${key}": ${(err as Error).message}`)
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    if (!this.isReady()) return
    try {
      let cursor = '0'
      do {
        const [nextCursor, keys] = await this.redis!.scan(cursor, 'MATCH', `*${pattern}*`, 'COUNT', 100)
        cursor = nextCursor
        if (keys.length > 0) {
          await this.redis!.del(...keys)
        }
      } while (cursor !== '0')
    } catch (err) {
      this.logger.warn(`Failed to delete pattern "${pattern}": ${(err as Error).message}`)
    }
  }

  async acquireLock(resource: string, ttlMs: number = 5000): Promise<boolean> {
    if (!this.isReady()) return true
    try {
      const lockKey = `lock:${resource}`
      const result = await this.redis!.set(lockKey, 'locked', 'PX', ttlMs, 'NX')
      return result === 'OK'
    } catch {
      return true
    }
  }

  async releaseLock(resource: string): Promise<void> {
    if (!this.isReady()) return
    try {
      await this.redis!.del(`lock:${resource}`)
    } catch (err) {
      this.logger.warn(`Failed to release lock "${resource}": ${(err as Error).message}`)
    }
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlSeconds: number = 300): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached

    const fresh = await factory()
    await this.set(key, fresh, ttlSeconds)
    return fresh
  }

  private isReady(): boolean {
    return this.redisReady && this.redis !== null
  }
}
