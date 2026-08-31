import { Module } from '@nestjs/common'
import { AffiliatesController } from './affiliates.controller'
import { AffiliatesGrpcController } from '../grpc/affiliates-grpc.controller'
import {
  CreateProgramHandler,
  UpdateProgramHandler,
  RegisterAffiliateHandler,
  RecordCommissionHandler,
  ProcessPayoutHandler,
} from '../../application/commands/affiliate.handlers'
import {
  GetProgramHandler,
  ListProgramsHandler,
  GetAffiliateHandler,
  ListAffiliatesHandler,
  GetCommissionsHandler,
  GetPayoutsHandler,
} from '../../application/queries/affiliate.handlers'
import { AffiliateProgramRepository } from '../../domain/repositories/affiliate-program.repository'
import { AffiliateRepository } from '../../domain/repositories/affiliate.repository'
import { CommissionRepository } from '../../domain/repositories/commission.repository'
import { DrizzleAffiliateProgramRepository } from '../../infrastructure/drizzle-affiliate-program.repository'
import { DrizzleAffiliateRepository } from '../../infrastructure/drizzle-affiliate.repository'
import { DrizzleCommissionRepository } from '../../infrastructure/drizzle-commission.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Module({
  controllers: [AffiliatesController, AffiliatesGrpcController],
  providers: [
    CreateProgramHandler,
    UpdateProgramHandler,
    RegisterAffiliateHandler,
    RecordCommissionHandler,
    ProcessPayoutHandler,
    GetProgramHandler,
    ListProgramsHandler,
    GetAffiliateHandler,
    ListAffiliatesHandler,
    GetCommissionsHandler,
    GetPayoutsHandler,
    OutboxService,
    { provide: AffiliateProgramRepository, useClass: DrizzleAffiliateProgramRepository },
    { provide: AffiliateRepository, useClass: DrizzleAffiliateRepository },
    { provide: CommissionRepository, useClass: DrizzleCommissionRepository },
  ],
  exports: [AffiliateProgramRepository, AffiliateRepository, CommissionRepository],
})
export class AffiliatesModule {}
