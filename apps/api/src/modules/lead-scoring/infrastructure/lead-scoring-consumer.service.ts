import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { NatsConsumerService, DomainEventEnvelope } from '../../../common/nats/nats-consumer.service'
import { RecalculateLeadScoreHandler } from '../application/commands/score.handlers'
import { RecalculateLeadScoreCommand } from '../application/commands/lead-scoring.commands'

@Injectable()
export class LeadScoringConsumerService implements OnModuleInit {
  private readonly logger = new Logger(LeadScoringConsumerService.name)

  constructor(
    private readonly natsConsumer: NatsConsumerService,
    private readonly recalculateHandler: RecalculateLeadScoreHandler,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.subscribeToLeadEvents()
  }

  private async subscribeToLeadEvents(): Promise<void> {
    const queueGroup = 'lead-scoring-auto-engine'

    await this.natsConsumer.subscribe(
      'crm.contact.created',
      queueGroup,
      this.handleContactEvent.bind(this),
    )

    await this.natsConsumer.subscribe(
      'crm.contacts.created',
      queueGroup,
      this.handleContactEvent.bind(this),
    )

    await this.natsConsumer.subscribe(
      'crm.web_forms.submitted',
      queueGroup,
      this.handleInboundSubmissionEvent.bind(this),
    )

    await this.natsConsumer.subscribe(
      'crm.meta_leads.received',
      queueGroup,
      this.handleInboundSubmissionEvent.bind(this),
    )

    await this.natsConsumer.subscribe(
      'crm.tiktok_leads.received',
      queueGroup,
      this.handleInboundSubmissionEvent.bind(this),
    )

    this.logger.log('LeadScoringConsumerService subscribed to lead capture and contact events')
  }

  private async handleContactEvent(
    envelope: DomainEventEnvelope<Record<string, unknown>>,
  ): Promise<void> {
    const p = envelope.payload || {}
    const contactId = String(p.contactId || p.id || envelope.aggregateId || '')
    const tenantId = String(p.tenantId || '00000000-0000-0000-0000-000000000001')

    if (!contactId || !tenantId) return

    try {
      this.logger.log(`Evaluating automatic lead score for contact ${contactId} (tenant ${tenantId})`)
      const contactContext = {
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        leadSource: p.leadSource || 'Inbound',
        jobTitle: p.jobTitle,
        city: p.city,
        country: p.country,
        ...p,
      }

      await this.recalculateHandler.execute(
        new RecalculateLeadScoreCommand(tenantId, contactId, contactContext),
      )
    } catch (error) {
      this.logger.error(`Error calculating lead score for contact ${contactId}: ${error}`)
    }
  }

  private async handleInboundSubmissionEvent(
    envelope: DomainEventEnvelope<Record<string, unknown>>,
  ): Promise<void> {
    const p = envelope.payload || {}
    const contactId = String(p.contactId || p.id || '')
    const tenantId = String(p.tenantId || '00000000-0000-0000-0000-000000000001')

    if (!contactId) return

    try {
      this.logger.log(`Processing inbound lead submission scoring for contact ${contactId}`)
      const context = {
        hasFormSubmission: true,
        source: envelope.eventType,
        ...p,
      }

      await this.recalculateHandler.execute(
        new RecalculateLeadScoreCommand(tenantId, contactId, context),
      )
    } catch (error) {
      this.logger.error(`Error scoring inbound lead submission ${contactId}: ${error}`)
    }
  }
}
