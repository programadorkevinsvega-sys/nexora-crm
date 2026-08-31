export abstract class ICachePort {
  abstract get<T>(key: string): Promise<T | null>
  abstract set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
  abstract delete(key: string): Promise<void>
  abstract deletePattern(pattern: string): Promise<void>
  abstract acquireLock(resource: string, ttlMs: number): Promise<boolean>
  abstract releaseLock(resource: string): Promise<void>
  abstract getOrSet<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number): Promise<T>
}
