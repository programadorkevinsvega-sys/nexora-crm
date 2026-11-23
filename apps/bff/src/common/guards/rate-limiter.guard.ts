import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { CacheService } from '../cache/cache.service'
import { THROTTLE_LIMIT_KEY, THROTTLE_TTL_KEY } from '../decorators/throttle.decorator'

interface RateLimitRequest {
  user?: { tenantId?: unknown; sub?: unknown; userId?: unknown }
  apiKeyContext?: { keyId?: unknown }
  headers?: Record<string, string | string[] | undefined>
  ip?: string
  socket?: { remoteAddress?: string }
  route?: { path?: string }
  path?: string
}

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private inMemoryFallback = new Map<string, { count: number; expiresAt: number }>()

  constructor(
    private readonly reflector: Reflector,
    private readonly cache: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp()
    const request = http.getRequest<RateLimitRequest>()
    const response = http.getResponse()

    // 1. Determine rate limits from decorator or defaults
    const customLimit = this.reflector.getAllAndOverride<number>(THROTTLE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    const customTtl = this.reflector.getAllAndOverride<number>(THROTTLE_TTL_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const limit = customLimit ?? (process.env.DEFAULT_RATE_LIMIT ? parseInt(process.env.DEFAULT_RATE_LIMIT, 10) : 120)
    const ttl = customTtl ?? 60

    // 2. Identify client (Authenticated User, API Key, or Client IP)
    const clientId = this.extractClientId(request)
    const routePath = request.route?.path || request.path || 'global'
    const rateLimitKey = `rate:limit:${clientId}:${routePath}`

    // 3. Count requests
    let count = await this.cache.increment(rateLimitKey, ttl)

    // Fallback if Redis returned 0 (unavailable or offline)
    if (count === 0) {
      count = this.incrementMemoryFallback(rateLimitKey, ttl)
    }

    // 4. Set standard RateLimit headers if response is available
    if (response && typeof response.setHeader === 'function') {
      response.setHeader('X-RateLimit-Limit', limit.toString())
      response.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count).toString())
      response.setHeader('X-RateLimit-Reset', ttl.toString())
    }

    // 5. Enforce limit
    if (count > limit) {
      if (response && typeof response.setHeader === 'function') {
        response.setHeader('Retry-After', ttl.toString())
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `Límite de solicitudes excedido (${limit} peticiones / ${ttl}s). Por favor intente más tarde.`,
          retryAfterSeconds: ttl,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      )
    }

    return true
  }

  private extractClientId(request: RateLimitRequest): string {
    const tenantId = typeof request.user?.tenantId === 'string' ? request.user.tenantId : undefined
    const userId = typeof request.user?.sub === 'string' ? request.user.sub
      : typeof request.user?.userId === 'string' ? request.user.userId : undefined
    if (tenantId && userId) return `usr:${tenantId}:${userId}`
    const keyId = typeof request.apiKeyContext?.keyId === 'string' ? request.apiKeyContext.keyId : undefined
    if (keyId) return `key:${keyId}`
    const forwardedHeader = request.headers?.['x-forwarded-for']
    const forwarded = Array.isArray(forwardedHeader) ? forwardedHeader[0] : forwardedHeader
    if (typeof forwarded === 'string' && forwarded.trim()) {
      return `ip:${forwarded.split(',')[0].trim()}`
    }
    return `ip:${request.ip || request.socket?.remoteAddress || 'unknown'}`
  }

  private incrementMemoryFallback(key: string, ttlSeconds: number): number {
    const now = Date.now()
    const entry = this.inMemoryFallback.get(key)

    if (!entry || entry.expiresAt <= now) {
      this.inMemoryFallback.set(key, { count: 1, expiresAt: now + ttlSeconds * 1000 })
      return 1
    }

    entry.count += 1
    return entry.count
  }
}
