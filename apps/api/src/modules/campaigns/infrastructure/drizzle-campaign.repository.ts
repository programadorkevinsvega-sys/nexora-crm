import { Injectable } from '@nestjs/common'
import { eq, ilike, and, asc, or, gt } from 'drizzle-orm'
import { getDb, campaigns as campaignsTable, campaignMembers as campaignMembersTable } from '@crm/database'
import { CampaignRepository, CampaignFilter, PaginatedCampaigns, PaginatedCampaignMembers } from '../domain/repositories/campaign.repository'
import { Campaign } from '../domain/entities/campaign.entity'
import { CampaignMember, CampaignMemberStatus } from '../domain/entities/campaign-member.entity'
import { CampaignMapper } from './campaign.mapper'

@Injectable()
export class DrizzleCampaignRepository extends CampaignRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<Campaign | null> {
    const row = await this.db.query.campaigns.findFirst({
      where: and(eq(campaignsTable.tenantId, tenantId)!, eq(campaignsTable.id, id)) as any,
    })
    return row ? CampaignMapper.toDomain(row) : null
  }

  async findMemberById(tenantId: string, id: string): Promise<CampaignMember | null> {
    const row = await this.db.query.campaignMembers.findFirst({
      where: and(eq(campaignMembersTable.tenantId, tenantId)!, eq(campaignMembersTable.id, id)) as any,
    })
    return row ? CampaignMapper.memberToDomain(row) : null
  }

  async list(tenantId: string, filter: CampaignFilter): Promise<PaginatedCampaigns> {
    const conditions = [eq(campaignsTable.tenantId, tenantId)]

    if (filter.cursor) conditions.push(gt(campaignsTable.createdAt, new Date(filter.cursor)))
    if (filter.search) {
      conditions.push(or(ilike(campaignsTable.name, `%${filter.search}%`))!,
      )
    }
    if (filter.status) conditions.push(eq(campaignsTable.status, filter.status))
    if (filter.type) conditions.push(eq(campaignsTable.type, filter.type))

    const rows = await this.db.query.campaigns.findMany({
      where: and(...conditions.filter(Boolean)!) as any,
      limit: filter.limit + 1,
      orderBy: [asc(campaignsTable.createdAt), asc(campaignsTable.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map(CampaignMapper.toDomain),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async listMembers(tenantId: string, campaignId: string, cursor?: string, limit = 50): Promise<PaginatedCampaignMembers> {
    const conditions = [
      eq(campaignMembersTable.tenantId, tenantId),
      eq(campaignMembersTable.campaignId, campaignId),
    ]

    if (cursor) conditions.push(gt(campaignMembersTable.createdAt, new Date(cursor))!)

    const rows = await this.db.query.campaignMembers.findMany({
      where: and(...conditions.filter(Boolean)!) as any,
      limit: limit + 1,
      orderBy: [asc(campaignMembersTable.createdAt), asc(campaignMembersTable.id)],
    })

    const hasMore = rows.length > limit
    const data = hasMore ? rows.slice(0, limit) : rows

    return {
      data: data.map(CampaignMapper.memberToDomain),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async save(campaign: Campaign): Promise<void> {
    const row = CampaignMapper.toPersistence(campaign)
    await this.db.insert(campaignsTable).values(row).onConflictDoUpdate({
      target: campaignsTable.id,
      set: row,
    })
  }

  async saveMember(member: CampaignMember): Promise<void> {
    const row = CampaignMapper.memberToPersistence(member)
    await this.db.insert(campaignMembersTable).values(row).onConflictDoUpdate({
      target: campaignMembersTable.id,
      set: row,
    })
  }

  async updateMemberStatus(tenantId: string, id: string, status: CampaignMemberStatus, respondedAt: Date | null): Promise<void> {
    await this.db.update(campaignMembersTable)
      .set({ status, respondedAt })
      .where(and(eq(campaignMembersTable.tenantId, tenantId), eq(campaignMembersTable.id, id)))
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(campaignsTable).where(
      and(eq(campaignsTable.tenantId, tenantId), eq(campaignsTable.id, id)),
    )
  }

  async deleteMember(tenantId: string, id: string): Promise<void> {
    await this.db.delete(campaignMembersTable).where(
      and(eq(campaignMembersTable.tenantId, tenantId), eq(campaignMembersTable.id, id)),
    )
  }
}
