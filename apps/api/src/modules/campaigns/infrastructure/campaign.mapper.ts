import { Campaign } from '../domain/entities/campaign.entity'
import { CampaignMember } from '../domain/entities/campaign-member.entity'

type CampaignRow = {
  id: string
  tenantId: string
  name: string
  type: string | null
  status: string | null
  startDate: string | null
  endDate: string | null
  budgetedCost: string | null
  actualCost: string | null
  expectedRevenue: string | null
  createdAt: Date
  updatedAt: Date
}

type CampaignMemberRow = {
  id: string
  tenantId: string
  campaignId: string
  contactId: string
  status: string | null
  respondedAt: Date | null
  createdAt: Date
}

export class CampaignMapper {
  static toDomain(row: CampaignRow): Campaign {
    return new Campaign(
      row.id,
      row.tenantId,
      row.name,
      row.type,
      row.status as Campaign['status'],
      row.startDate,
      row.endDate,
      row.budgetedCost ? Number(row.budgetedCost) : null,
      row.actualCost ? Number(row.actualCost) : null,
      row.expectedRevenue ? Number(row.expectedRevenue) : null,
      row.createdAt,
      row.updatedAt,
    )
  }

  static toPersistence(campaign: Campaign): CampaignRow {
    return {
      id: campaign.id,
      tenantId: campaign.tenantId,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      budgetedCost: campaign.budgetedCost?.toString() ?? null,
      actualCost: campaign.actualCost?.toString() ?? null,
      expectedRevenue: campaign.expectedRevenue?.toString() ?? null,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    }
  }

  static toResponse(campaign: Campaign) {
    return {
      id: campaign.id,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      budgetedCost: campaign.budgetedCost,
      actualCost: campaign.actualCost,
      expectedRevenue: campaign.expectedRevenue,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
    }
  }

  static memberToDomain(row: CampaignMemberRow): CampaignMember {
    return new CampaignMember(
      row.id,
      row.tenantId,
      row.campaignId,
      row.contactId,
      row.status as CampaignMember['status'],
      row.respondedAt,
      row.createdAt,
    )
  }

  static memberToPersistence(member: CampaignMember): CampaignMemberRow {
    return {
      id: member.id,
      tenantId: member.tenantId,
      campaignId: member.campaignId,
      contactId: member.contactId,
      status: member.status,
      respondedAt: member.respondedAt,
      createdAt: member.createdAt,
    }
  }

  static memberToResponse(member: CampaignMember) {
    return {
      id: member.id,
      campaignId: member.campaignId,
      contactId: member.contactId,
      status: member.status,
      respondedAt: member.respondedAt?.toISOString() ?? null,
      createdAt: member.createdAt.toISOString(),
    }
  }
}
