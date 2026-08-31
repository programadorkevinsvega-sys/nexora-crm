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

@Module({
  controllers: [AiController, AiGrpcController],
  providers: [
    GenerateMessageDraftHandler,
    GetDealWinProbabilityHandler,
    GetContactExecutiveSummaryHandler,
    GetChurnRiskPredictionHandler,
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
