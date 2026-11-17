import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { NatsConsumerService, DomainEventEnvelope } from '../../../common/nats/nats-consumer.service'
import { TriggerEventHandler } from '../application/commands/workflow.handlers'
import { TriggerEventCommand } from '../application/commands/workflow.commands'

@Injectable()
export class AutomationConsumerService implements OnModuleInit {
  private readonly logger = new Logger(AutomationConsumerService.name)

  constructor(
    private readonly natsConsumer: NatsConsumerService,
    private readonly triggerEventHandler: TriggerEventHandler,
  ) {}

  async onModuleInit(): Promise<void> {
    const queueGroup = 'workflow-automation-engine'

    const subjects = [
      'crm.contact.created',
      'crm.contacts.created',
      'crm.contact.updated',
      'crm.deal.created',
      'crm.deal.won',
      'crm.deal.lost',
      'crm.deal.moved',
      'crm.call.created',
      'crm.call.completed',
      'crm.web_forms.submitted',
      'crm.social_inbox.comment_received',
      'crm.ai.sentiment_analyzed',
      'crm.lead.score_updated',
      'crm.lead.score_threshold_reached',
    ]

    for (const subject of subjects) {
      await this.natsConsumer.subscribe(
        subject,
        queueGroup,
        this.handleDomainEvent.bind(this),
      )
    }

    this.logger.log(`AutomationConsumerService subscribed to ${subjects.length} NATS domain events`)
  }

  private async handleDomainEvent(
    envelope: DomainEventEnvelope<Record<string, unknown>>,
  ): Promise<void> {
    const p = envelope.payload || {}
    const tenantId = String(p.tenantId || '00000000-0000-0000-0000-000000000001')
    const entityType = this.deriveEntityType(envelope.eventType)
    const entityId = String(
      p.contactId || p.dealId || p.callId || p.id || envelope.aggregateId || 'unknown',
    )
    const eventName = envelope.eventType

    try {
      this.logger.log(
        `Evaluating active workflows for event "${eventName}" on ${entityType}:${entityId} (tenant ${tenantId})`,
      )

      await this.triggerEventHandler.execute(
        new TriggerEventCommand(
          tenantId,
          eventName,
          entityType,
          entityId,
          { ...p, eventId: envelope.eventId, occurredOn: envelope.occurredOn },
        ),
      )
    } catch (error) {
      this.logger.error(`Error triggering workflows for event ${eventName}: ${error}`)
    }
  }

  private deriveEntityType(eventType: string): string {
    if (eventType.includes('contact')) return 'CONTACT'
    if (eventType.includes('deal')) return 'DEAL'
    if (eventType.includes('call') || eventType.includes('voip')) return 'CALL'
    if (eventType.includes('form')) return 'FORM'
    if (eventType.includes('social')) return 'SOCIAL'
    if (eventType.includes('sentiment') || eventType.includes('ai')) return 'AI'
    if (eventType.includes('score')) return 'LEAD_SCORE'
    return 'SYSTEM'
  }
}
