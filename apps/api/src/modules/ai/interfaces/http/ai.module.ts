import { Module } from '@nestjs/common'
import { AiController } from './ai.controller'
import { AiGrpcController } from '../grpc/ai-grpc.controller'
import { GenerateMessageDraftHandler } from '../../application/commands/ai.handlers'
import {
  GetDealWinProbabilityHandler,
  GetContactExecutiveSummaryHandler,
  GetChurnRiskPredictionHandler,
} from '../../application/queries/ai.handlers'
import { AiRepository } from '../../domain/repositories/ai.repository'
import { DrizzleAiRepository } from '../../infrastructure/drizzle-ai.repository'
import { AiInteractionsConsumerService } from '../../infrastructure/ai-interactions-consumer.service'
import { AiSdrConsumerService } from '../../infrastructure/ai-sdr-consumer.service'
import { QualifyLeadBantHandler } from '../../application/commands/qualify-bant.handler'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Module({
  controllers: [AiController, AiGrpcController],
  providers: [
    GenerateMessageDraftHandler,
    GetDealWinProbabilityHandler,
    GetContactExecutiveSummaryHandler,
    GetChurnRiskPredictionHandler,
    QualifyLeadBantHandler,
    AiInteractionsConsumerService,
    AiSdrConsumerService,
    OutboxService,
    {
      provide: AiRepository,
      useClass: DrizzleAiRepository,
    },
  ],
  exports: [
    AiRepository,
    GenerateMessageDraftHandler,
    GetDealWinProbabilityHandler,
    GetContactExecutiveSummaryHandler,
    GetChurnRiskPredictionHandler,
  ],
})
export class AiModule {}
