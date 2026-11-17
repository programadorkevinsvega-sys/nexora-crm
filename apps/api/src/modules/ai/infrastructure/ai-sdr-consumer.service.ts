import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { NatsConsumerService, DomainEventEnvelope } from '../../../common/nats/nats-consumer.service'
import { QualifyLeadBantHandler } from '../application/commands/qualify-bant.handler'

@Injectable()
export class AiSdrConsumerService implements OnModuleInit {
  private readonly logger = new Logger(AiSdrConsumerService.name)

  constructor(
    private readonly natsConsumer: NatsConsumerService,
    private readonly qualifyBantHandler: QualifyLeadBantHandler,
  ) {}

  async onModuleInit(): Promise<void> {
    const queueGroup = 'ai-sdr-qualification-engine'

    const subjects = [
      'crm.web_forms.submitted',
      'crm.meta_leads.received',
      'crm.tiktok_leads.received',
      'crm.inbox.message_received',
      'crm.whatsapp.message_received',
    ]

    for (const subject of subjects) {
      await this.natsConsumer.subscribe(
        subject,
        queueGroup,
        this.handleInboundLead.bind(this),
      )
    }

    this.logger.log('AiSdrConsumerService subscribed to inbound lead channels for BANT qualification')
  }

  private async handleInboundLead(
    envelope: DomainEventEnvelope<Record<string, unknown>>,
  ): Promise<void> {
    const p = envelope.payload || {}
    const tenantId = String(p.tenantId || '00000000-0000-0000-0000-000000000001')
    const contactId = String(p.contactId || p.id || envelope.aggregateId || 'unknown-lead')
    const messageOrNotes = String(p.message || p.notes || p.formValues || p.content || '')
    const jobTitle = String(p.jobTitle || p.position || p.role || '')
    const budgetDeclared = p.budget as number | string | undefined
    const timelineDeclared = p.timeline as string | undefined

    try {
      this.logger.log(`AI SDR evaluating BANT qualification for contact ${contactId} (${envelope.eventType})`)

      await this.qualifyBantHandler.execute({
        tenantId,
        contactId,
        messageOrNotes,
        jobTitle,
        budgetDeclared,
        timelineDeclared,
      })
    } catch (error) {
      this.logger.error(`Failed to qualify lead via AI SDR: ${error}`)
    }
  }
}
