import { Injectable, Logger } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

export interface TiktokIntegrationState {
  tenantId: string
  status: 'CONNECTED' | 'DISCONNECTED'
  advertiserId?: string | null
  pixelId?: string | null
  webhookUrl: string
  leadsReceived: number
  lastLeadAt?: string | null
}

const store = new Map<string, TiktokIntegrationState>()

@Injectable()
export class TiktokLeadsBffService {
  private readonly logger = new Logger(TiktokLeadsBffService.name)

  constructor(private readonly api: ApiCoreGrpcClient) {}

  getStatus(tenantId?: string): TiktokIntegrationState {
    const tid = tenantId || DEFAULT_TENANT_ID
    if (!store.has(tid)) {
      store.set(tid, {
        tenantId: tid,
        status: 'DISCONNECTED',
        webhookUrl: `${process.env.BFF_PUBLIC_URL || 'https://crm.nexora.app'}/api/integrations/tiktok/webhook`,
        leadsReceived: 0,
      })
    }
    return store.get(tid)!
  }

  getWebhookUrl(tenantId?: string) {
    const tid = tenantId || DEFAULT_TENANT_ID
    const base = process.env.BFF_PUBLIC_URL || 'https://crm.nexora.app'
    return {
      webhookUrl: `${base}/api/integrations/tiktok/webhook`,
      instructions: [
        '1. Abre TikTok Ads Manager → Herramientas → Generación de Clientes Potenciales → Webhooks',
        '2. Selecciona tu formulario Instant Form',
        '3. En "Server URL" pega la URL del Webhook indicada',
        '4. Activa el evento "lead" y guarda los cambios',
        '5. Cada prospecto se sincronizará automáticamente en Nexora CRM',
      ],
    }
  }

  async saveConfig(
    dto: { accessToken?: string; pixelId?: string; advertiserAccessToken?: string; advertiserId?: string },
    tenantId?: string,
  ): Promise<TiktokIntegrationState> {
    const tid = tenantId || DEFAULT_TENANT_ID
    const current = this.getStatus(tid)
    store.set(tid, {
      ...current,
      status: 'CONNECTED',
      advertiserId: dto.advertiserId || null,
      pixelId: dto.pixelId || null,
    })
    this.logger.log(`TikTok Leads integration configured for tenant: ${tid}`)
    return store.get(tid)!
  }

  async processWebhookLead(body: any, tenantId?: string): Promise<{ received: boolean; contactId?: string }> {
    const tid = tenantId || DEFAULT_TENANT_ID
    this.logger.log(`TikTok lead webhook received for tenant: ${tid}`)

    try {
      const leadData = body?.lead_data || body
      const name = leadData?.name || 'Lead TikTok'
      const email = leadData?.email || `${Date.now()}@tiktok-lead.com`
      const phone = leadData?.phone_number || leadData?.phone || '+18005550199'
      const now = new Date()

      const [firstName, ...rest] = name.split(' ')

      const contact = await this.api.createContact({
        tenantId: tid,
        firstName: firstName || 'Lead',
        lastName: rest.join(' ') || 'TikTok',
        email,
        phone,
        leadSource: 'TikTok Lead Ads',
        leadStatus: 'QUALIFIED',
      })

      const pipelines = await this.api.listPipelines(tid)
      const pipeline = pipelines[0]

      if (pipeline) {
        const board = await this.api.getPipelineBoard(tid, pipeline.id)
        const stage = board.stages[0]

        if (stage) {
          await this.api.createDeal({
            tenantId: tid,
            pipelineId: pipeline.id,
            stageId: stage.id,
            contactId: contact.id,
            name: `TikTok Lead: ${name}`,
            amount: 0,
          })
        }
      }

      const current = this.getStatus(tid)
      store.set(tid, {
        ...current,
        status: 'CONNECTED',
        leadsReceived: (current.leadsReceived || 0) + 1,
        lastLeadAt: now.toISOString(),
      })

      return { received: true, contactId: contact.id }
    } catch (err: any) {
      this.logger.error(`Failed to process TikTok lead: ${err.message}`)
      return { received: false }
    }
  }

  disconnect(tenantId?: string): { success: boolean } {
    const tid = tenantId || DEFAULT_TENANT_ID
    const current = this.getStatus(tid)
    store.set(tid, { ...current, status: 'DISCONNECTED', advertiserId: null, pixelId: null })
    return { success: true }
  }
}
