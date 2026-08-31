import { Module } from '@nestjs/common'
import { LeadScoringController } from './lead-scoring.controller'
import { LeadScoringGrpcController } from '../grpc/lead-scoring-grpc.controller'
import {
  CreateScoringRuleHandler,
  ToggleRuleStatusHandler,
  RecalculateLeadScoreHandler,
  AdjustLeadScoreHandler,
  ApplyScoreDecayHandler,
} from '../../application/commands/lead-scoring.handlers'
import {
  GetLeadScoreHandler,
  ListScoringRulesHandler,
  ListTopLeadsHandler,
  ListLeadsByTemperatureHandler,
} from '../../application/queries/lead-scoring.handlers'
import {
  LeadScoringRuleRepository,
  LeadScoreRepository,
} from '../../domain/repositories/lead-scoring.repository'
import {
  DrizzleLeadScoringRuleRepository,
  DrizzleLeadScoreRepository,
} from '../../infrastructure/drizzle-lead-scoring.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Module({
  controllers: [LeadScoringController, LeadScoringGrpcController],
  providers: [
    CreateScoringRuleHandler,
    ToggleRuleStatusHandler,
    RecalculateLeadScoreHandler,
    AdjustLeadScoreHandler,
    ApplyScoreDecayHandler,
    GetLeadScoreHandler,
    ListScoringRulesHandler,
    ListTopLeadsHandler,
    ListLeadsByTemperatureHandler,
    OutboxService,
    {
      provide: LeadScoringRuleRepository,
      useClass: DrizzleLeadScoringRuleRepository,
    },
    {
      provide: LeadScoreRepository,
      useClass: DrizzleLeadScoreRepository,
    },
  ],
  exports: [
    LeadScoringRuleRepository,
    LeadScoreRepository,
    RecalculateLeadScoreHandler,
    AdjustLeadScoreHandler,
  ],
})
export class LeadScoringModule {}
