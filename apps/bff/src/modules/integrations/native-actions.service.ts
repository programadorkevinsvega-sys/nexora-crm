import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { CacheService } from '../../common/cache/cache.service'
import { SlackDispatcher } from './dispatchers/slack.dispatcher'
import { DiscordDispatcher } from './dispatchers/discord.dispatcher'
import { AccountingDispatcher } from './dispatchers/accounting.dispatcher'
import { SecretsVault } from '@crm/shared'
import type { IntegrationProvider } from '@crm/contracts'

export interface NativeActionPayload {
  action: 'SEND_SLACK' | 'SEND_DISCORD' | 'SYNC_ACCOUNTING' | string
  channel?: string
  message?: string
  title?: string
  amount?: number
  currency?: string
  customerName?: string
  customerEmail?: string
  customerTaxId?: string
  items?: Array<{ description: string; quantity: number; unitPrice: number }>
  webhookUrl?: string
  provider?: string
  contextData?: Record<string, any>
}

@Injectable()
export class NativeActionsService {
  private readonly logger = new Logger(NativeActionsService.name)

  constructor(
    private readonly cache: CacheService,
    private readonly slackDispatcher: SlackDispatcher,
    private readonly discordDispatcher: DiscordDispatcher,
    private readonly accountingDispatcher: AccountingDispatcher,
  ) {}

  private async getDecryptedCredentials(tenantId: string, provider: IntegrationProvider): Promise<Record<string, any>> {
    const stored = await this.cache.get<any>(`integration:${tenantId}:${provider}`)
    if (!stored?.credentials) return {}

    const decrypted: Record<string, any> = {}
    for (const [k, v] of Object.entries(stored.credentials)) {
      if (typeof v === 'string' && SecretsVault.isEncrypted(v)) {
        decrypted[k] = SecretsVault.decrypt(v, tenantId)
      } else {
        decrypted[k] = v
      }
    }
    return decrypted
  }

  async executeSlack(tenantId: string, payload: NativeActionPayload): Promise<any> {
    const creds = await this.getDecryptedCredentials(tenantId, 'SLACK_APP')
    const botToken = creds.botToken
    const channel = payload.channel || creds.defaultChannel || '#general'
    const message = payload.message || `Notificación automática desde Nexora CRM: ${payload.title || 'Evento'}`

    if (!botToken) {
      this.logger.warn(`Tenant ${tenantId} dispatched SEND_SLACK but no botToken configured`)
      return { success: false, message: 'Slack no está configurado con Bot Token (xoxb-...) en este tenant' }
    }

    if (payload.amount && payload.title) {
      await this.slackDispatcher.postDealNotification(
        botToken,
        channel,
        payload.title,
        payload.amount,
        payload.currency || 'USD',
        payload.customerName || 'Ejecutivo CRM',
      )
      return { success: true, message: `Alerta de venta enviada a Slack #${channel}` }
    }

    return this.slackDispatcher.test(creds, channel, message)
  }

  async executeDiscord(tenantId: string, payload: NativeActionPayload): Promise<any> {
    const creds = await this.getDecryptedCredentials(tenantId, 'DISCORD')
    const webhookUrl = payload.webhookUrl || creds.webhookUrl || creds.url

    if (!webhookUrl) {
      return { success: false, message: 'Discord no tiene Webhook URL configurada en este tenant' }
    }

    if (payload.amount && payload.title) {
      return this.discordDispatcher.postDealAlert(webhookUrl, {
        name: payload.title,
        amount: payload.amount,
        stage: 'WON',
        contactName: payload.customerName,
      })
    }

    return this.discordDispatcher.sendMessage(webhookUrl, {
      content: payload.message || `🚀 Alerta de Automatización: ${payload.title || 'Evento procesado'}`,
      username: creds.botName || 'Nexora Sales Bot',
    })
  }

  async executeAccounting(tenantId: string, payload: NativeActionPayload): Promise<any> {
    const creds = await this.getDecryptedCredentials(tenantId, 'ACCOUNTING')
    const provider = payload.provider || creds.provider || 'QUICKBOOKS'

    const invoiceData = {
      customerName: payload.customerName || 'Cliente Nexora CRM',
      customerEmail: payload.customerEmail || 'cliente@ejemplo.com',
      customerTaxId: payload.customerTaxId || 'NIT-000000',
      items: payload.items || [
        {
          description: payload.title || 'Servicio / Licencia Nexora CRM',
          quantity: 1,
          unitPrice: payload.amount || 100,
        },
      ],
      totalAmount: payload.amount || 100,
      currency: payload.currency || 'USD',
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      referenceId: `CRM-${Date.now()}`,
    }

    return this.accountingDispatcher.syncInvoice({ ...creds, provider }, invoiceData)
  }

  async executeAction(tenantId: string, payload: NativeActionPayload): Promise<any> {
    this.logger.log(`Executing native external action: ${payload.action} for tenant ${tenantId}`)
    switch (payload.action) {
      case 'SEND_SLACK':
        return this.executeSlack(tenantId, payload)
      case 'SEND_DISCORD':
        return this.executeDiscord(tenantId, payload)
      case 'SYNC_ACCOUNTING':
        return this.executeAccounting(tenantId, payload)
      default:
        throw new BadRequestException(`Acción nativa no soportada: ${payload.action}`)
    }
  }
}
