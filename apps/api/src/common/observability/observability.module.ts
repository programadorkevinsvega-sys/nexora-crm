import { Module, Global } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { MetricsService } from './metrics.service'
import { StructuredLoggingInterceptor } from './structured-logging.interceptor'

@Global()
@Module({
  providers: [
    MetricsService,
    StructuredLoggingInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useExisting: StructuredLoggingInterceptor,
    },
  ],
  exports: [MetricsService],
})
export class ObservabilityModule {}
