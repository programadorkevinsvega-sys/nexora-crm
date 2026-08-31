import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { getDb, metaIntegrations, metaLeadAdLogs, contacts, deals, pipelines, pipelineStages } from '@crm/database'
import { eq, and, desc, sql } from 'drizzle-orm'
import type { MetaIntegration, MetaLeadAdLog, MetaConfigUpdate, SimulateMetaLead, MetaLeadForm } from '@crm/contracts'

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

@Injectable()
export class MetaLeadsBffService {
  private readonly logger = new Logger(MetaLeadsBffService.name)

  private get db() {
    return getDb()
  }

  async getStatus(tenantId?: string): Promise<MetaIntegration> {
    const tid = tenantId || DEFAULT_TENANT_ID
    let [integration] = await this.db.select().from(metaIntegrations).where(eq(metaIntegrations.tenantId, tid)).limit(1)

    if (!integration) {
      const now = new Date()
      const [created] = await this.db
        .insert(metaIntegrations)
        .values({
          id: crypto.randomUUID(),
          tenantId: tid,
          status: 'DISCONNECTED',
          metaAppId: process.env.META_APP_ID || '104857291029384',
          webhookSecret: `fb_verify_${crypto.randomUUID().slice(0, 8)}`,
          leadGenForms: [
            { formId: 'meta_form_101', formName: 'Formulario Clientes Potenciales - Facebook Ads', status: 'ACTIVE', leadsCount: 38, defaultLeadStatus: 'NEW' },
            { formName: 'Registro Demo Software LATAM 2026', formId: 'meta_form_102', status: 'ACTIVE', leadsCount: 19, defaultLeadStatus: 'QUALIFIED' },
          ],
          autoCreateDeal: true,
          createdAt: now,
          updatedAt: now,
        })
        .returning()
      integration = created
    }

    return integration as MetaIntegration
  }

  getOAuthUrl(tenantId?: string, redirectUri?: string): { url: string; state: string } {
    const tid = tenantId || DEFAULT_TENANT_ID
    const appId = process.env.META_APP_ID || '104857291029384'
    const redirect = redirectUri || 'http://localhost:3000/integrations/facebook/callback'
    const state = `tenant_${tid}_${Date.now()}`
    const scopes = [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_ads',
      'pages_manage_metadata',
      'leads_retrieval',
      'ads_management',
    ].join(',')

    const url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirect)}&state=${state}&scope=${encodeURIComponent(scopes)}&response_type=code`

    return { url, state }
  }

  async handleOAuthCallback(code: string, tenantId?: string): Promise<MetaIntegration> {
    const tid = tenantId || DEFAULT_TENANT_ID
    const now = new Date()
    const expiresAt = new Date(Date.now() + 60 * 86400000)

    const [updated] = await this.db
      .update(metaIntegrations)
      .set({
        status: 'CONNECTED',
        metaUserId: 'meta_usr_99887711',
        metaUserName: 'Nexora Marketing Director',
        accessToken: `EAAB${crypto.randomUUID().replace(/-/g, '')}`,
        tokenExpiresAt: expiresAt,
        selectedPageId: 'page_33445566',
        selectedPageName: 'Nexora Enterprise Software & AI',
        pageAccessToken: `EAAP${crypto.randomUUID().replace(/-/g, '')}`,
        adAccountId: 'act_90881122',
        adAccountName: 'Cuenta Publicitaria Nexora Growth',
        lastSyncAt: now,
        updatedAt: now,
      })
      .where(eq(metaIntegrations.tenantId, tid))
      .returning()

    return updated as MetaIntegration
  }

  async updateConfig(dto: MetaConfigUpdate, tenantId?: string): Promise<MetaIntegration> {
    const tid = tenantId || DEFAULT_TENANT_ID
    const now = new Date()

    const [updated] = await this.db
      .update(metaIntegrations)
      .set({ ...dto, updatedAt: now })
      .where(eq(metaIntegrations.tenantId, tid))
      .returning()

    return updated as MetaIntegration
  }

  async syncForms(tenantId?: string): Promise<MetaLeadForm[]> {
    const integration = await this.getStatus(tenantId)
    const forms: MetaLeadForm[] = [
      { formId: 'meta_form_101', formName: 'Formulario Clientes Potenciales - Facebook Ads', status: 'ACTIVE', leadsCount: (integration.leadGenForms?.[0]?.leadsCount || 0) + 1, defaultLeadStatus: 'NEW' },
      { formId: 'meta_form_102', formName: 'Registro Demo Software LATAM 2026', status: 'ACTIVE', leadsCount: (integration.leadGenForms?.[1]?.leadsCount || 0), defaultLeadStatus: 'QUALIFIED' },
      { formId: 'meta_form_103', formName: 'Descarga Ebook Arquitectura CRM Enterprise', status: 'ACTIVE', leadsCount: 42, defaultLeadStatus: 'NEW' },
    ]

    await this.db
      .update(metaIntegrations)
      .set({ leadGenForms: forms, lastSyncAt: new Date(), updatedAt: new Date() })
      .where(eq(metaIntegrations.id, integration.id))

    return forms
  }

  async disconnect(tenantId?: string): Promise<void> {
    const tid = tenantId || DEFAULT_TENANT_ID
    await this.db
      .update(metaIntegrations)
      .set({
        status: 'DISCONNECTED',
        accessToken: null,
        pageAccessToken: null,
        selectedPageId: null,
        selectedPageName: null,
        updatedAt: new Date(),
      })
      .where(eq(metaIntegrations.tenantId, tid))
  }

  async listLogs(tenantId?: string): Promise<MetaLeadAdLog[]> {
    const tid = tenantId || DEFAULT_TENANT_ID
    const logs = await this.db
      .select()
      .from(metaLeadAdLogs)
      .where(eq(metaLeadAdLogs.tenantId, tid))
      .orderBy(desc(metaLeadAdLogs.receivedAt))
      .limit(50)

    return logs as MetaLeadAdLog[]
  }

  async simulateLead(dto: SimulateMetaLead, tenantId?: string) {
    const tid = tenantId || DEFAULT_TENANT_ID
    const integration = await this.getStatus(tid)
    const now = new Date()

    // 1. Create Contact
    const contactId = crypto.randomUUID()
    const names = dto.fullName.split(' ')
    const firstName = names[0] || 'Lead'
    const lastName = names.slice(1).join(' ') || null

    await this.db.insert(contacts).values({
      id: contactId,
      tenantId: tid,
      firstName,
      lastName,
      email: dto.email,
      phone: dto.phone || '+57-310-555-0199',
      jobTitle: dto.jobTitle || 'Gerente Comercial',
      leadSource: 'Facebook Lead Ads',
      leadStatus: 'QUALIFIED',
      metadata: { campaignName: dto.campaignName, adName: dto.adName, formName: dto.formName },
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing()

    // 2. Create Deal if enabled
    let dealId: string | null = null
    if (integration.autoCreateDeal) {
      const [firstPipeline] = await this.db.select().from(pipelines).where(eq(pipelines.tenantId, tid)).limit(1)
      if (firstPipeline) {
        const [firstStage] = await this.db.select().from(pipelineStages).where(eq(pipelineStages.pipelineId, firstPipeline.id)).orderBy(pipelineStages.displayOrder).limit(1)
        dealId = crypto.randomUUID()
        await this.db.insert(deals).values({
          id: dealId,
          tenantId: tid,
          pipelineId: integration.targetPipelineId || firstPipeline.id,
          stageId: integration.targetStageId || (firstStage?.id || crypto.randomUUID()),
          contactId,
          name: `Meta Lead: ${dto.fullName} — ${dto.companyName || 'B2B Enterprise'}`,
          amount: '45000',
          status: 'OPEN',
          expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          createdAt: now,
          updatedAt: now,
        }).onConflictDoNothing()
      }
    }

    // 3. Record Log
    const logId = crypto.randomUUID()
    const leadgenId = `leadgen_${Date.now()}`
    const [log] = await this.db
      .insert(metaLeadAdLogs)
      .values({
        id: logId,
        tenantId: tid,
        metaIntegrationId: integration.id,
        leadgenId,
        formName: dto.formName,
        campaignName: dto.campaignName,
        adName: dto.adName,
        contactId,
        dealId,
        leadData: dto,
        status: 'PROCESSED',
        receivedAt: now,
      })
      .returning()

    return { success: true, contactId, dealId, log }
  }
}
