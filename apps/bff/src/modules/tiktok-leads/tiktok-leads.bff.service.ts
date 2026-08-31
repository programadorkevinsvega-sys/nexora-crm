import { Injectable, Logger } from '@nestjs/common'
import { getDb, contacts, deals, pipelines, pipelineStages } from '@crm/database'
import { eq } from 'drizzle-orm'

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

  private get db() { return getDb() }

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

      const contactId = crypto.randomUUID()
      const [firstName, ...rest] = name.split(' ')

      await this.db.insert(contacts).values({
        id: contactId,
        tenantId: tid,
        firstName: firstName || 'Lead',
        lastName: rest.join(' ') || 'TikTok',
        email,
        phone,
        leadSource: 'TikTok Lead Ads',
        leadStatus: 'QUALIFIED',
        createdAt: now,
        updatedAt: now,
      }).onConflictDoNothing()

      const [pipeline] = await this.db
        .select()
        .from(pipelines)
        .where(eq(pipelines.tenantId, tid))
        .limit(1)

      if (pipeline) {
        const [stage] = await this.db
          .select()
          .from(pipelineStages)
          .where(eq(pipelineStages.pipelineId, pipeline.id))
          .limit(1)

        if (stage) {
          await this.db.insert(deals).values({
            id: crypto.randomUUID(),
            tenantId: tid,
            pipelineId: pipeline.id,
            stageId: stage.id,
            contactId,
            name: `TikTok Lead: ${name}`,
            amount: '0',
            status: 'OPEN',
            createdAt: now,
            updatedAt: now,
          }).onConflictDoNothing()
        }
      }

      const current = this.getStatus(tid)
      store.set(tid, {
        ...current,
        status: 'CONNECTED',
        leadsReceived: (current.leadsReceived || 0) + 1,
        lastLeadAt: now.toISOString(),
      })

      return { received: true, contactId }
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
