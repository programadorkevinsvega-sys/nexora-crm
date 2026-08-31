import { Module } from '@nestjs/common'
import { SalesTeamsController } from './sales-teams.controller'
import { SalesTeamsGrpcController } from '../grpc/sales-teams-grpc.controller'
import {
  CreateTeamHandler, UpdateTeamHandler, DeleteTeamHandler,
  AddMemberHandler, RemoveMemberHandler,
  SetQuotaHandler, UpdateAchievedHandler,
} from '../../application/commands/sales-team.handlers'
import { GetTeamHandler, ListTeamsHandler, GetTeamMembersHandler, GetQuotaHandler, ListQuotasHandler } from '../../application/queries/sales-team.handlers'
import { SalesTeamRepository } from '../../domain/repositories/sales-team.repository'
import { SalesQuotaRepository } from '../../domain/repositories/sales-quota.repository'
import { DrizzleSalesTeamRepository } from '../../infrastructure/drizzle-sales-team.repository'
import { DrizzleSalesQuotaRepository } from '../../infrastructure/drizzle-sales-quota.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Module({
  controllers: [SalesTeamsController, SalesTeamsGrpcController],
  providers: [
    CreateTeamHandler,
    UpdateTeamHandler,
    DeleteTeamHandler,
    AddMemberHandler,
    RemoveMemberHandler,
    SetQuotaHandler,
    UpdateAchievedHandler,
    GetTeamHandler,
    ListTeamsHandler,
    GetTeamMembersHandler,
    GetQuotaHandler,
    ListQuotasHandler,
    OutboxService,
    { provide: SalesTeamRepository, useClass: DrizzleSalesTeamRepository },
    { provide: SalesQuotaRepository, useClass: DrizzleSalesQuotaRepository },
  ],
  exports: [SalesTeamRepository, SalesQuotaRepository],
})
export class SalesTeamsModule {}
