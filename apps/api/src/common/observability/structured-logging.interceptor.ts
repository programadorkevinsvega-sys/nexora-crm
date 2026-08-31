import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { MetricsService } from './metrics.service'

@Injectable()
export class StructuredLoggingInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now()
    const type = context.getType()
    const className = context.getClass().name
    const handlerName = context.getHandler().name
    const operation = `${className}.${handlerName}`
    const traceId = crypto.randomUUID()
    const spanId = crypto.randomUUID().slice(0, 16)

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - start
          this.metrics.recordLatency(operation, durationMs)

          const logPayload = {
            timestamp: new Date().toISOString(),
            service: 'crm-api',
            module: className.replace('Controller', '').replace('Grpc', '').toLowerCase(),
            type,
            operation,
            trace_id: traceId,
            span_id: spanId,
            duration_ms: durationMs,
            status: 'SUCCESS',
          }
          process.stdout.write(JSON.stringify(logPayload) + '\n')
        },
        error: (err: Error) => {
          const durationMs = Date.now() - start
          this.metrics.recordLatency(operation, durationMs)

          const logPayload = {
            timestamp: new Date().toISOString(),
            service: 'crm-api',
            module: className.replace('Controller', '').replace('Grpc', '').toLowerCase(),
            type,
            operation,
            trace_id: traceId,
            span_id: spanId,
            duration_ms: durationMs,
            status: 'ERROR',
            error: err.message,
          }
          process.stderr.write(JSON.stringify(logPayload) + '\n')
        },
      }),
    )
  }
}
