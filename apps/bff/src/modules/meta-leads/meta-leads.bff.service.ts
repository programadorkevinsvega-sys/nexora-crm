import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { getDb, metaIntegrations, metaLeadAdLogs } from '@crm/database'
import { eq, desc } from 'drizzle-orm'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import type {
  MetaIntegration, MetaLeadAdLog, MetaConfigUpdate, SimulateMetaLead,
  MetaLeadForm, ConnectMetaPageInput
} from '@crm/contracts'

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

@Injectable()
export class MetaLeadsBffService {
  private readonly logger = new Logger(MetaLeadsBffService.name)

  constructor(private readonly api: ApiCoreGrpcClient) {}

  private get db() {
    return getDb()
  }

  // Keeping direct DB access to metaIntegrations and metaLeadAdLogs 
  // as they are configuration data owned by this module.
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
          metaAppId: process.env.META_APP_ID || null,
          webhookSecret: `fb_verify_${crypto.randomUUID().slice(0, 8)}`,
          leadGenForms: [],
          autoCreateDeal: true,
          createdAt: now,
          updatedAt: now,
        })
        .returning()
      integration = created
    }

    return integration as MetaIntegration
  }

  getOAuthUrl(tenantId?: string, redirectUri?: string, customAppId?: string): { url: string; state: string } {
    const tid = tenantId || DEFAULT_TENANT_ID
    const appId = customAppId || process.env.META_APP_ID || ''
    if (!appId) {
      throw new NotFoundException(
        'No se ha proporcionado un Meta App ID (Client ID). Ingresa tu Meta App ID o utiliza la conexión directa mediante Token de Acceso.',
      )
    }
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
        accessToken: `EAAB_${code.slice(0, 16)}`,
        tokenExpiresAt: expiresAt,
        lastSyncAt: now,
        updatedAt: now,
      })
      .where(eq(metaIntegrations.tenantId, tid))
      .returning()

    return updated as MetaIntegration
  }

  async fetchMetaPagesAndAccounts(accessToken: string): Promise<{
    pages: Array<{ id: string; name: string; access_token?: string; category?: string }>
    adAccounts: Array<{ id: string; name: string }>
  }> {
    try {
      const pagesRes = await fetch(
        `https://graph.facebook.com/v20.0/me/accounts?access_token=${encodeURIComponent(accessToken)}&fields=id,name,access_token,category`
      )
      const pagesData = await pagesRes.json()
      const pages = Array.isArray(pagesData.data)
        ? pagesData.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            access_token: p.access_token,
            category: p.category,
          }))
        : []

      const adsRes = await fetch(
        `https://graph.facebook.com/v20.0/me/adaccounts?access_token=${encodeURIComponent(accessToken)}&fields=id,name,account_id`
      )
      const adsData = await adsRes.json()
      const adAccounts = Array.isArray(adsData.data)
        ? adsData.data.map((a: any) => ({
            id: a.id || a.account_id,
            name: a.name || `Cuenta Ads ${a.id}`,
          }))
        : []

      return { pages, adAccounts }
    } catch (err: any) {
      this.logger.error(`Error querying Meta Graph API: ${err.message}`)
      return { pages: [], adAccounts: [] }
    }
  }

  async connectPage(dto: ConnectMetaPageInput, tenantId?: string): Promise<MetaIntegration> {
    const tid = tenantId || DEFAULT_TENANT_ID
    const now = new Date()
    let forms: MetaLeadForm[] = []

    if (dto.pageAccessToken && dto.pageId) {
      try {
        const formsRes = await fetch(
          `https://graph.facebook.com/v20.0/${dto.pageId}/leadgen_forms?access_token=${encodeURIComponent(dto.pageAccessToken)}&fields=id,name,status,leads_count`
        )
        const formsData = await formsRes.json()
        if (Array.isArray(formsData.data)) {
          forms = formsData.data.map((f: any) => ({
            formId: f.id,
            formName: f.name,
            status: f.status || 'ACTIVE',
            leadsCount: f.leads_count || 0,
            defaultLeadStatus: 'NEW',
          }))
        }
      } catch (err: any) {
        this.logger.warn(`Could not fetch leadgen forms immediately: ${err.message}`)
      }
    }

    const [updated] = await this.db
      .update(metaIntegrations)
      .set({
        status: 'CONNECTED',
        selectedPageId: dto.pageId,
        selectedPageName: dto.pageName,
        pageAccessToken: dto.pageAccessToken || null,
        adAccountId: dto.adAccountId || null,
        adAccountName: dto.adAccountName || null,
        accessToken: dto.userAccessToken || null,
        metaAppId: dto.metaAppId || null,
        leadGenForms: forms,
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
    let forms: MetaLeadForm[] = (integration.leadGenForms as MetaLeadForm[]) || []

    if (integration.selectedPageId && (integration as any).pageAccessToken) {
      try {
        const formsRes = await fetch(
          `https://graph.facebook.com/v20.0/${integration.selectedPageId}/leadgen_forms?access_token=${encodeURIComponent((integration as any).pageAccessToken)}&fields=id,name,status,leads_count`
        )
        const formsData = await formsRes.json()
        if (Array.isArray(formsData.data)) {
          forms = formsData.data.map((f: any) => ({
            formId: f.id,
            formName: f.name,
            status: f.status || 'ACTIVE',
            leadsCount: f.leads_count || 0,
            defaultLeadStatus: 'NEW',
          }))

          await this.db
            .update(metaIntegrations)
            .set({ leadGenForms: forms, lastSyncAt: new Date(), updatedAt: new Date() })
            .where(eq(metaIntegrations.id, integration.id))
        }
      } catch (err: any) {
        this.logger.warn(`Failed to sync forms from Graph API: ${err.message}`)
      }
    }

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
        adAccountId: null,
        adAccountName: null,
        leadGenForms: [],
        updatedAt: new Date(),
      })
      .where(eq(metaIntegrations.tenantId, tid))
  }

  async listLogs(tenantId?: string): Promise<MetaLeadAdLog[]> {
    const tid = tenantId || DEFAULT_TENANT_ID
    return (await this.db.select().from(metaLeadAdLogs).where(eq(metaLeadAdLogs.tenantId, tid)).orderBy(desc(metaLeadAdLogs.receivedAt)).limit(50)) as MetaLeadAdLog[]
  }

  async simulateLead(dto: SimulateMetaLead, tenantId?: string) {
    const tid = tenantId || DEFAULT_TENANT_ID
    const integration = await this.getStatus(tid)
    const now = new Date()
    const names = dto.fullName.split(' ')

    const contact = await this.api.createContact({
      tenantId: tid,
      firstName: names[0] || 'Lead',
      lastName: names.slice(1).join(' ') || null,
      email: dto.email,
      phone: dto.phone || '+57-310-555-0199',
      jobTitle: dto.jobTitle || 'Gerente Comercial',
      leadSource: 'Facebook Lead Ads',
      leadStatus: 'QUALIFIED',
      metadata: { campaignName: dto.campaignName, adName: dto.adName, formName: dto.formName },
    })
    
    const contactId = contact.id
    let dealId: string | null = null

    if (integration.autoCreateDeal) {
      const pipelines = await this.api.listPipelines(tid)
      const firstPipeline = pipelines[0]
      if (firstPipeline) {
        const board = await this.api.getPipelineBoard(tid, firstPipeline.id)
        const firstStage = board.stages[0]
        
        const deal = await this.api.createDeal({
          tenantId: tid,
          pipelineId: integration.targetPipelineId || firstPipeline.id,
          stageId: integration.targetStageId || (firstStage?.id || crypto.randomUUID()),
          contactId,
          name: `Meta Lead: ${dto.fullName} — ${dto.companyName || 'B2B Enterprise'}`,
          amount: 45000,
          expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        })
        dealId = deal.id
      }
    }

    const logId = crypto.randomUUID()
    const [log] = await this.db.insert(metaLeadAdLogs).values({
      id: logId,
      tenantId: tid,
      metaIntegrationId: integration.id,
      leadgenId: `leadgen_${Date.now()}`,
      formName: dto.formName,
      campaignName: dto.campaignName,
      adName: dto.adName,
      contactId,
      dealId,
      leadData: dto,
      status: 'PROCESSED',
      receivedAt: now,
    }).returning()

    return { success: true, contactId, dealId, log }
  }
}
