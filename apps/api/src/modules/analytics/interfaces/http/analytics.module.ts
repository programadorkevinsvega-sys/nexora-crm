import { Module } from '@nestjs/common'
import { AnalyticsController } from './analytics.controller'
import { AnalyticsGrpcController } from '../grpc/analytics-grpc.controller'
import {
  GetRevenueMetricsHandler,
  GetFunnelMetricsHandler,
  GetCohortMetricsHandler,
  GetRevenueForecastHandler,
} from '../../application/queries/analytics.handlers'
import { AnalyticsRepository } from '../../domain/repositories/analytics.repository'
import { DrizzleAnalyticsRepository } from '../../infrastructure/drizzle-analytics.repository'
import { DrizzleForecastRepository } from '../../infrastructure/drizzle-forecast.repository'

@Module({
  controllers: [AnalyticsController, AnalyticsGrpcController],
  providers: [
    GetRevenueMetricsHandler,
    GetFunnelMetricsHandler,
    GetCohortMetricsHandler,
    GetRevenueForecastHandler,
    DrizzleForecastRepository,
    {
      provide: AnalyticsRepository,
      useClass: DrizzleAnalyticsRepository,
    },
  ],
  exports: [
    AnalyticsRepository,
    GetRevenueMetricsHandler,
    GetFunnelMetricsHandler,
    GetCohortMetricsHandler,
    GetRevenueForecastHandler,
  ],
})
export class AnalyticsModule {}
