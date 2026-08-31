import { Injectable } from '@nestjs/common'
import { getDb, metaIntegrations, metaLeadAdLogs } from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import { MetaIntegration, MetaLeadForm } from '../../../domain/entities/meta-integration.entity'
import { MetaLeadLog } from '../../../domain/entities/meta-lead-log.entity'
import { MetaLeadsRepository } from '../../../domain/repositories/meta-leads.repository'

@Injectable()
export class DrizzleMetaLeadsRepository implements MetaLeadsRepository {
  private get db() {
    return getDb()
  }

  async findByTenantId(tenantId: string): Promise<MetaIntegration | null> {
    const [row] = await this.db
      .select()
      .from(metaIntegrations)
      .where(eq(metaIntegrations.tenantId, tenantId))
      .limit(1)

    return row ? this.toDomainIntegration(row) : null
  }

  async save(integration: MetaIntegration): Promise<MetaIntegration> {
    const [created] = await this.db
      .insert(metaIntegrations)
      .values({
        id: integration.id,
        tenantId: integration.tenantId,
        status: integration.status,
        metaAppId: integration.metaAppId,
        metaUserId: integration.metaUserId,
        metaUserName: integration.metaUserName,
        accessToken: integration.accessToken,
        tokenExpiresAt: integration.tokenExpiresAt,
        selectedPageId: integration.selectedPageId,
        selectedPageName: integration.selectedPageName,
        pageAccessToken: integration.pageAccessToken,
        adAccountId: integration.adAccountId,
        adAccountName: integration.adAccountName,
        webhookSecret: integration.webhookSecret,
        leadGenForms: integration.leadGenForms,
        autoCreateDeal: integration.autoCreateDeal,
        targetPipelineId: integration.targetPipelineId,
        targetStageId: integration.targetStageId,
        lastSyncAt: integration.lastSyncAt,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
      })
      .returning()

    return this.toDomainIntegration(created)
  }

  async update(integration: Partial<MetaIntegration> & { id: string; tenantId: string }): Promise<MetaIntegration> {
    const [updated] = await this.db
      .update(metaIntegrations)
      .set({
        ...integration,
        updatedAt: new Date(),
      })
      .where(and(eq(metaIntegrations.id, integration.id), eq(metaIntegrations.tenantId, integration.tenantId)))
      .returning()

    return this.toDomainIntegration(updated)
  }

  async saveLog(log: MetaLeadLog): Promise<MetaLeadLog> {
    const [created] = await this.db
      .insert(metaLeadAdLogs)
      .values({
        id: log.id,
        tenantId: log.tenantId,
        metaIntegrationId: log.metaIntegrationId,
        leadgenId: log.leadgenId,
        formId: log.formId,
        formName: log.formName,
        adId: log.adId,
        adName: log.adName,
        campaignName: log.campaignName,
        contactId: log.contactId,
        dealId: log.dealId,
        leadData: log.leadData,
        status: log.status,
        errorMessage: log.errorMessage,
        receivedAt: log.receivedAt,
      })
      .returning()

    return this.toDomainLog(created)
  }

  async listLogs(tenantId: string, limit = 50): Promise<MetaLeadLog[]> {
    const rows = await this.db
      .select()
      .from(metaLeadAdLogs)
      .where(eq(metaLeadAdLogs.tenantId, tenantId))
      .orderBy(desc(metaLeadAdLogs.receivedAt))
      .limit(limit)

    return rows.map((r) => this.toDomainLog(r))
  }

  private toDomainIntegration(row: typeof metaIntegrations.$inferSelect): MetaIntegration {
    return new MetaIntegration(
      row.id,
      row.tenantId,
      row.status,
      row.metaAppId,
      row.metaUserId,
      row.metaUserName,
      row.accessToken,
      row.tokenExpiresAt,
      row.selectedPageId,
      row.selectedPageName,
      row.pageAccessToken,
      row.adAccountId,
      row.adAccountName,
      row.webhookSecret || '',
      (row.leadGenForms as MetaLeadForm[]) || [],
      row.autoCreateDeal,
      row.targetPipelineId,
      row.targetStageId,
      row.lastSyncAt,
      row.createdAt,
      row.updatedAt,
    )
  }

  private toDomainLog(row: typeof metaLeadAdLogs.$inferSelect): MetaLeadLog {
    return new MetaLeadLog(
      row.id,
      row.tenantId,
      row.metaIntegrationId,
      row.leadgenId,
      row.formId,
      row.formName,
      row.adId,
      row.adName,
      row.campaignName,
      row.contactId,
      row.dealId,
      (row.leadData as Record<string, any>) || {},
      row.status,
      row.errorMessage,
      row.receivedAt,
    )
  }
}
