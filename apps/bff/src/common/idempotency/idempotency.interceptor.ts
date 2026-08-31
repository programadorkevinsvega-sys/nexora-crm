import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
  Logger,
} from '@nestjs/common'
import { Observable, of, throwError } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { CacheService } from '../cache/cache.service'
import { Request, Response } from 'express'

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name)

  constructor(private readonly cacheService: CacheService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const http = context.switchToHttp()
    const req = http.getRequest<Request>()
    const res = http.getResponse<Response>()

    const method = req.method.toUpperCase()
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle()
    }

    const idempotencyKey = (req.headers['idempotency-key'] || req.headers['x-idempotency-key']) as string
    if (!idempotencyKey) {
      return next.handle()
    }

    const tenantId = (req.headers['x-tenant-id'] as string) || 'global'
    const cacheKey = `idempotency:${tenantId}:${idempotencyKey}`
    const lockKey = `idempotency:lock:${tenantId}:${idempotencyKey}`

    const cachedRaw = await this.cacheService.getRaw(cacheKey)
    if (cachedRaw) {
      this.logger.log(`Idempotency HIT for key "${idempotencyKey}"`)
      try {
        const cached = JSON.parse(cachedRaw)
        if (res && res.setHeader) {
          res.setHeader('X-Idempotent-Replay', 'true')
          if (cached.statusCode) res.status(cached.statusCode)
        }
        return of(cached.body)
      } catch {
        // Continue to fresh execution if JSON corrupted
      }
    }

    const acquired = await this.cacheService.setNx(lockKey, 'IN_FLIGHT', 60)
    if (!acquired) {
      this.logger.warn(`Idempotency conflict for in-flight key "${idempotencyKey}"`)
      throw new ConflictException('A request with this Idempotency-Key is currently in flight')
    }

    return next.handle().pipe(
      tap(async (body) => {
        try {
          const statusCode = res ? res.statusCode || 200 : 200
          await this.cacheService.setRaw(
            cacheKey,
            JSON.stringify({ statusCode, body }),
            86400,
          )
          await this.cacheService.del(lockKey)
        } catch (err) {
          this.logger.warn(`Failed to persist idempotency cache: ${(err as Error).message}`)
        }
      }),
      catchError(async (err) => {
        await this.cacheService.del(lockKey)
        return throwError(() => err)
      }),
    )
  }
}
