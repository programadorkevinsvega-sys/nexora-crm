import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, ConflictException, Logger,
} from '@nestjs/common'
import { Observable, of, throwError } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { CacheService } from '../cache/cache.service'
import type { Request, Response } from 'express'

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor<unknown, unknown> {
  private readonly logger = new Logger(IdempotencyInterceptor.name)
  constructor(private readonly cacheService: CacheService) {}

  async intercept(context: ExecutionContext, next: CallHandler<unknown>): Promise<Observable<unknown>> {
    const http = context.switchToHttp()
    const req = http.getRequest<Request>()
    const res = http.getResponse<Response>()
    const method = req.method.toUpperCase()
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return next.handle()

    const headerKey = req.headers['idempotency-key'] ?? req.headers['x-idempotency-key']
    const idempotencyKey = typeof headerKey === 'string' ? headerKey : undefined
    if (!idempotencyKey) return next.handle()

    const tenantHeader = req.headers['x-tenant-id']
    const tenantId = typeof tenantHeader === 'string' ? tenantHeader : 'global'
    const cacheKey = `idempotency:${tenantId}:${idempotencyKey}`
    const lockKey = `idempotency:lock:${tenantId}:${idempotencyKey}`

    const cachedRaw = await this.cacheService.getRaw(cacheKey)
    if (cachedRaw) {
      this.logger.log(`Idempotency HIT for key "${idempotencyKey}"`)
      try {
        const cached = JSON.parse(cachedRaw) as { statusCode?: number; body?: unknown }
        res.setHeader('X-Idempotent-Replay', 'true')
        if (cached.statusCode) res.status(cached.statusCode)
        return of(cached.body)
      } catch {
        // Continue to fresh execution if cached JSON is corrupted.
      }
    }

    const acquired = await this.cacheService.setNx(lockKey, 'IN_FLIGHT', 60)
    if (!acquired) {
      this.logger.warn(`Idempotency conflict for in-flight key "${idempotencyKey}"`)
      throw new ConflictException('A request with this Idempotency-Key is currently in flight')
    }

    return next.handle().pipe(
      tap(async (body: unknown) => {
        try {
          await this.cacheService.setRaw(
            cacheKey,
            JSON.stringify({ statusCode: res.statusCode || 200, body }),
            86400,
          )
          await this.cacheService.del(lockKey)
        } catch (error: unknown) {
          this.logger.warn(`Failed to persist idempotency cache: ${error instanceof Error ? error.message : String(error)}`)
        }
      }),
      catchError((error: unknown) => {
        return this.cacheService.del(lockKey).then(() => throwError(() => error))
      }),
    )
  }
}