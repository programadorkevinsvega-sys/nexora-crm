/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NotFoundException } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import type {
  MetaIntegration, MetaLeadAdLog, MetaConfigUpdate, SimulateMetaLead,
  MetaLeadForm, ConnectMetaPageInput,
} from '@crm/contracts'
import { MetaGraphApiHelper } from './meta-graph-api.helper'

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

@Injectable()
export class MetaLeadsBffService {
  constructor(private readonly api: ApiCoreGrpcClient) {}

  async getStatus(tenantId?: string): Promise<MetaIntegration> {
    const tid = tenantId || DEFAULT_TENANT_ID
    return this.api.getMetaStatus(tid)
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
    const expiresAt = new Date(Date.now() + 60 * 86400000)

    return this.api.updateMetaConfig({
      tenantId: tid,
      status: 'CONNECTED',
      accessToken: `EAAB_${code.slice(0, 16)}`,
      tokenExpiresAt: expiresAt,
      lastSyncAt: new Date(),
    })
  }

  async fetchMetaPagesAndAccounts(accessToken: string) {
    return MetaGraphApiHelper.fetchPagesAndAccounts(accessToken)
  }

  async connectPage(dto: ConnectMetaPageInput, tenantId?: string): Promise<MetaIntegration> {
    const tid = tenantId || DEFAULT_TENANT_ID
    let forms: MetaLeadForm[] = []

    if (dto.pageAccessToken && dto.pageId) {
      forms = await MetaGraphApiHelper.fetchLeadGenForms(dto.pageId, dto.pageAccessToken)
    }

    return this.api.connectMetaPage({
      tenantId: tid,
      pageId: dto.pageId,
      pageName: dto.pageName,
      pageAccessToken: dto.pageAccessToken,
      adAccountId: dto.adAccountId,
      adAccountName: dto.adAccountName,
      userAccessToken: dto.userAccessToken,
      metaAppId: dto.metaAppId,
      leadGenForms: forms,
    })
  }

  async updateConfig(dto: MetaConfigUpdate, tenantId?: string): Promise<MetaIntegration> {
    const tid = tenantId || DEFAULT_TENANT_ID
    return this.api.updateMetaConfig({ ...dto, tenantId: tid })
  }

  async syncForms(tenantId?: string): Promise<MetaLeadForm[]> {
    const tid = tenantId || DEFAULT_TENANT_ID
    const integration = await this.getStatus(tid)
    let forms: MetaLeadForm[] = (integration.leadGenForms as MetaLeadForm[]) || []

    if (integration.selectedPageId && (integration as any).pageAccessToken) {
      const fetched = await MetaGraphApiHelper.fetchLeadGenForms(
        integration.selectedPageId,
        (integration as any).pageAccessToken,
      )
      if (fetched.length > 0) {
        forms = fetched
        await this.api.updateMetaConfig({
          tenantId: tid,
          leadGenForms: forms,
          lastSyncAt: new Date(),
        })
      }
    }

    return forms
  }

  async disconnect(tenantId?: string): Promise<void> {
    const tid = tenantId || DEFAULT_TENANT_ID
    await this.api.disconnectMeta(tid)
  }

  async listLogs(tenantId?: string): Promise<MetaLeadAdLog[]> {
    const tid = tenantId || DEFAULT_TENANT_ID
    return this.api.listMetaLogs(tid)
  }

  async simulateLead(dto: SimulateMetaLead, tenantId?: string) {
    const tid = tenantId || DEFAULT_TENANT_ID
    const integration = await this.getStatus(tid)
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

    const log = await this.api.saveMetaLeadLog({
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
    })

    return { success: true, contactId, dealId, log }
  }
}
