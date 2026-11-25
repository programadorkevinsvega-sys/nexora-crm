import { Injectable, Logger } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import { IntegrationsBffService } from '../integrations/integrations.bff.service'
import { IntegrationsDispatcher } from '../integrations/integrations.dispatcher'
import { SmtpEmailDispatcher } from '../integrations/dispatchers/smtp-email.dispatcher'
import { AwsSesDispatcher } from '../integrations/dispatchers/aws-ses.dispatcher'
import type { InboxConversation, InboxMessage, SendInboxMessage } from '@crm/contracts'

const CACHE_TTL_MS = 10_000
const CACHE_KEY_PREFIX = 'inbox:'

@Injectable()
export class InboxBffService {
  private readonly logger = new Logger(InboxBffService.name)
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
    private readonly integrationsService: IntegrationsBffService,
    private readonly dispatcher: IntegrationsDispatcher,
    private readonly smtpDispatcher: SmtpEmailDispatcher,
    private readonly sesDispatcher: AwsSesDispatcher,
  ) {}

  async listConversations(
    channel?: string,
    status?: string,
    tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<InboxConversation[]> {
    const cacheKey = `${CACHE_KEY_PREFIX}convs:${tenantId}:${channel ?? 'all'}:${status ?? 'all'}`
    return this.cache.getOrSet<InboxConversation[]>(
      cacheKey,
      () => this.api.listInboxConversations(tenantId, channel, status),
      CACHE_TTL_MS,
    )
  }

  async getConversation(id: string, tenantId = '00000000-0000-0000-0000-000000000001'): Promise<InboxConversation> {
    return this.api.getInboxConversation(tenantId, id)
  }

  async sendMessage(dto: SendInboxMessage, tenantId = '00000000-0000-0000-0000-000000000001'): Promise<InboxMessage> {
    const response = await this.api.sendInboxMessage({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    try {
      if (dto.channel === 'WHATSAPP') {
        const config = await this.integrationsService.getDecryptedConfig(tenantId, 'WHATSAPP_CLOUD')
        if (config) {
          this.logger.log(`Dispatching real WhatsApp message to ${dto.recipientIdentifier}`)
          await this.dispatcher.dispatchTest('WHATSAPP_CLOUD', config, dto.recipientIdentifier, dto.bodyText)
        }
      } else if (dto.channel === 'EMAIL') {
        const smtpConfig = await this.integrationsService.getDecryptedConfig(tenantId, 'SMTP_EMAIL')
        const sesConfig = await this.integrationsService.getDecryptedConfig(tenantId, 'AWS_SES')
        if (smtpConfig) {
          this.logger.log(`Dispatching real SMTP email to ${dto.recipientIdentifier}`)
          await this.smtpDispatcher.sendEmail(
            smtpConfig, dto.recipientIdentifier, dto.subject || 'Mensaje de Nexora CRM', dto.bodyText,
          )
        } else if (sesConfig) {
          this.logger.log(`Dispatching real AWS SES email to ${dto.recipientIdentifier}`)
          await this.sesDispatcher.sendEmail(
            sesConfig, dto.recipientIdentifier, dto.subject || 'Mensaje de Nexora CRM', dto.bodyText,
          )
        }
      }
    } catch (error: unknown) {
      this.logger.error(`External dispatch error in inbox sendMessage: ${error instanceof Error ? error.message : String(error)}`)
    }
    return response
  }
}