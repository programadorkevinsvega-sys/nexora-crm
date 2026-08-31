import { CampaignFilter } from '../../domain/repositories/campaign.repository'

export class GetCampaignQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListCampaignsQuery {
  constructor(readonly tenantId: string, readonly filter: CampaignFilter) {}
}

export class GetCampaignMembersQuery {
  constructor(
    readonly tenantId: string,
    readonly campaignId: string,
    readonly cursor?: string,
    readonly limit?: number,
  ) {}
}
