import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name)
  private redis: Redis | null = null
  private redisReady = false
  private fallbackLogged = false

  async onModuleInit(): Promise<void> {
    const redisUrl = process.env.REDIS_URL
    if (!redisUrl) {
      this.logger.warn('REDIS_URL not set, cache disabled')
      return
    }

    this.redis = new Redis(redisUrl, {
      lazyConnect: true,
      enableOfflineQueue: false,
    })

    this.redis.on('ready', () => {
      this.redisReady = true
      if (this.fallbackLogged) {
        this.logger.log('Redis reconnected, cache back online')
      } else {
        this.logger.log('Connected to Redis')
      }
      this.fallbackLogged = false
    })

    this.redis.on('error', (error) => {
      this.reportRedisUnavailable('Redis error', error)
    })

    this.redis.on('end', () => {
      this.reportRedisUnavailable('Redis connection ended')
    })

    try {
      await this.redis.connect()
    } catch (error) {
      this.reportRedisUnavailable('Failed to connect to Redis', error)
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.redis) return

    try {
      await this.redis.quit()
    } catch {
      this.redis.disconnect()
    }
  }

  async getOrSet<T>(key: string, fetch: () => Promise<T>, ttlMs: number = 30000): Promise<T> {
    const redis = this.getReadyRedis()
    if (redis) {
      try {
        const cached = await redis.get(key)
        if (cached) {
          try {
            return JSON.parse(cached) as T
          } catch {
            this.logger.warn(`Invalid cache payload for key "${key}", refreshing value`)
            await redis.del(key)
          }
        }
      } catch (error) {
        this.reportRedisUnavailable('Redis unavailable during getOrSet read', error)
      }
    }

    const data = await fetch()

    if (redis && this.redisReady) {
      try {
        await redis.setex(key, Math.ceil(ttlMs / 1000), JSON.stringify(data))
      } catch (error) {
        this.reportRedisUnavailable('Redis unavailable during getOrSet write', error)
      }
    }

    return data
  }

  async getRaw(key: string): Promise<string | null> {
    const redis = this.getReadyRedis()
    if (!redis) return null
    try {
      return await redis.get(key)
    } catch (error) {
      this.reportRedisUnavailable('Redis unavailable during getRaw', error)
      return null
    }
  }

  async setRaw(key: string, value: string, ttlSeconds: number = 86400): Promise<void> {
    const redis = this.getReadyRedis()
    if (!redis) return
    try {
      await redis.setex(key, ttlSeconds, value)
    } catch (error) {
      this.reportRedisUnavailable('Redis unavailable during setRaw', error)
    }
  }

  async setNx(key: string, value: string, ttlSeconds: number = 60): Promise<boolean> {
    const redis = this.getReadyRedis()
    if (!redis) return true
    try {
      const result = await redis.set(key, value, 'EX', ttlSeconds, 'NX')
      return result === 'OK'
    } catch (error) {
      this.reportRedisUnavailable('Redis unavailable during setNx', error)
      return true
    }
  }

  async increment(key: string, ttlSeconds: number): Promise<number> {
    const redis = this.getReadyRedis()
    if (!redis) return 0
    try {
      const current = await redis.incr(key)
      if (current === 1) await redis.expire(key, ttlSeconds)
      return current
    } catch (error) {
      this.reportRedisUnavailable('Redis unavailable during increment', error)
      return 0
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.getRaw(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 86400): Promise<void> {
    await this.setRaw(key, JSON.stringify(value), ttlSeconds)
  }

  async delete(key: string): Promise<void> {
    await this.del(key)
  }

  async del(key: string): Promise<void> {
    const redis = this.getReadyRedis()
    if (!redis) return
    try {
      await redis.del(key)
    } catch (error) {
      this.reportRedisUnavailable('Redis unavailable during del', error)
    }
  }

  async invalidate(pattern: string): Promise<void> {
    const redis = this.getReadyRedis()
    if (!redis) return

    try {
      const keys: string[] = []
      let cursor = '0'
      do {
        const result = await redis.scan(cursor, 'MATCH', `*${pattern}*`, 'COUNT', 100)
        cursor = result[0]
        keys.push(...result[1])
      } while (cursor !== '0')

      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      this.reportRedisUnavailable('Redis unavailable during cache invalidation', error)
    }
  }

  private getReadyRedis(): Redis | null {
    if (!this.redisReady) return null
    return this.redis
  }

  private reportRedisUnavailable(message: string, error?: unknown): void {
    this.redisReady = false
    if (this.fallbackLogged) return

    if (error instanceof Error) {
      this.logger.warn(`${message}: ${error.message}. Cache fallback enabled`)
    } else {
      this.logger.warn(`${message}. Cache fallback enabled`)
    }
    this.fallbackLogged = true
  }
}
