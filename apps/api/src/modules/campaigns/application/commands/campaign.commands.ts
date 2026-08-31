import { CampaignStatus } from '../../domain/entities/campaign.entity'
import { CampaignMemberStatus } from '../../domain/entities/campaign-member.entity'

export class CreateCampaignCommand {
  constructor(
    readonly tenantId: string,
    readonly name: string,
    readonly type?: string,
    readonly status?: CampaignStatus,
    readonly startDate?: string,
    readonly endDate?: string,
    readonly budgetedCost?: number,
    readonly actualCost?: number,
    readonly expectedRevenue?: number,
  ) {}
}

export class UpdateCampaignCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
    readonly name?: string,
    readonly type?: string,
    readonly startDate?: string,
    readonly endDate?: string,
    readonly budgetedCost?: number,
    readonly actualCost?: number,
    readonly expectedRevenue?: number,
  ) {}
}

export class ChangeCampaignStatusCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
    readonly status: CampaignStatus,
  ) {}
}

export class AddMemberCommand {
  constructor(
    readonly tenantId: string,
    readonly campaignId: string,
    readonly contactId: string,
  ) {}
}

export class UpdateMemberStatusCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
    readonly status: CampaignMemberStatus,
  ) {}
}

export class DeleteCampaignCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}
