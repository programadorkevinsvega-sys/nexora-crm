import { Module } from '@nestjs/common'
import { LoyaltyController } from './loyalty.controller'
import { LoyaltyGrpcController } from '../grpc/loyalty-grpc.controller'
import { EarnPointsHandler, RedeemPointsHandler, CreateSegmentHandler, AssignToSegmentHandler } from '../../application/commands/loyalty.handlers'
import { GetProfileHandler, GetSegmentsHandler, GetMetricsHandler } from '../../application/queries/loyalty.handlers'
import { LoyaltyRepository, SegmentRepository, MetricsRepository } from '../../domain/repositories/loyalty.repository'
import { DrizzleLoyaltyRepository, DrizzleSegmentRepository, DrizzleMetricsRepository } from '../../infrastructure/drizzle-loyalty.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Module({
  controllers: [LoyaltyController, LoyaltyGrpcController],
  providers: [
    EarnPointsHandler,
    RedeemPointsHandler,
    CreateSegmentHandler,
    AssignToSegmentHandler,
    GetProfileHandler,
    GetSegmentsHandler,
    GetMetricsHandler,
    OutboxService,
    { provide: LoyaltyRepository, useClass: DrizzleLoyaltyRepository },
    { provide: SegmentRepository, useClass: DrizzleSegmentRepository },
    { provide: MetricsRepository, useClass: DrizzleMetricsRepository },
  ],
  exports: [LoyaltyRepository, SegmentRepository, MetricsRepository],
})
export class LoyaltyModule {}
