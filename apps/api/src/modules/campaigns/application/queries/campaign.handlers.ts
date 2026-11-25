import { Injectable } from '@nestjs/common'
import { CampaignRepository } from '../../domain/repositories/campaign.repository'
import { GetCampaignQuery, ListCampaignsQuery, GetCampaignMembersQuery } from './campaign.queries'
import { NotFoundError } from '@crm/shared'

@Injectable()
export class GetCampaignHandler {
  constructor(private readonly repo: CampaignRepository) {}

  async execute(query: GetCampaignQuery) {
    const campaign = await this.repo.findById(query.tenantId, query.id)
    if (!campaign) throw new NotFoundError('Campaign', query.id)
    return campaign
  }
}

@Injectable()
export class ListCampaignsHandler {
  constructor(private readonly repo: CampaignRepository) {}

  async execute(query: ListCampaignsQuery) {
    return this.repo.list(query.tenantId, query.filter)
  }
}

@Injectable()
export class GetCampaignMembersHandler {
  constructor(private readonly repo: CampaignRepository) {}

  async execute(query: GetCampaignMembersQuery) {
    return this.repo.listMembers(query.tenantId, query.campaignId, query.cursor, query.limit)
  }
}
