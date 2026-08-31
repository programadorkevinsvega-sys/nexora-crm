import { Module } from '@nestjs/common'
import { CampaignsController } from './campaigns.controller'
import { CampaignsGrpcController } from '../grpc/campaigns-grpc.controller'
import {
  CreateCampaignHandler,
  UpdateCampaignHandler,
  ChangeCampaignStatusHandler,
  AddMemberHandler,
  UpdateMemberStatusHandler,
  DeleteCampaignHandler,
} from '../../application/commands/campaign.handlers'
import { GetCampaignHandler, ListCampaignsHandler, GetCampaignMembersHandler } from '../../application/queries/campaign.handlers'
import { CampaignRepository } from '../../domain/repositories/campaign.repository'
import { DrizzleCampaignRepository } from '../../infrastructure/drizzle-campaign.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Module({
  controllers: [CampaignsController, CampaignsGrpcController],
  providers: [
    CreateCampaignHandler,
    UpdateCampaignHandler,
    ChangeCampaignStatusHandler,
    AddMemberHandler,
    UpdateMemberStatusHandler,
    DeleteCampaignHandler,
    GetCampaignHandler,
    ListCampaignsHandler,
    GetCampaignMembersHandler,
    OutboxService,
    { provide: CampaignRepository, useClass: DrizzleCampaignRepository },
  ],
  exports: [CampaignRepository],
})
export class CampaignsModule {}
