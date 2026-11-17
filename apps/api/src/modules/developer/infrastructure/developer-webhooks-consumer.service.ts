import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { NatsConsumerService, DomainEventEnvelope } from '../../../common/nats/nats-consumer.service'
import { DispatchWebhookEventHandler } from '../application/commands/developer.handlers'
import { DispatchWebhookEventCommand } from '../application/commands/developer.commands'
import { WebhookEvent } from '@crm/contracts'

@Injectable()
export class DeveloperWebhooksConsumerService implements OnModuleInit {
  private readonly logger = new Logger(DeveloperWebhooksConsumerService.name)

  constructor(
    private readonly natsConsumer: NatsConsumerService,
    private readonly dispatchWebhookHandler: DispatchWebhookEventHandler,
  ) {}

  async onModuleInit(): Promise<void> {
    const queueGroup = 'developer-external-webhooks-engine'

    const eventMapping: Record<string, WebhookEvent> = {
      'crm.contact.created': 'contact.created',
      'crm.contact.updated': 'contact.updated',
      'crm.deal.won': 'deal.won',
      'crm.deal.lost': 'deal.lost',
      'crm.deal.moved': 'deal.stage_changed',
      'crm.contract.created': 'contract.signed',
      'crm.contract.signed': 'contract.signed',
      'crm.ticket.created': 'ticket.created',
      'crm.ticket.resolved': 'ticket.resolved',
    }

    for (const [subject, webhookEvent] of Object.entries(eventMapping)) {
      await this.natsConsumer.subscribe(
        subject,
        queueGroup,
        async (envelope: DomainEventEnvelope<Record<string, unknown>>) => {
          await this.dispatchToExternalEndpoints(webhookEvent, envelope)
        },
      )
    }

    this.logger.log('DeveloperWebhooksConsumerService initialized for external CRM/ERP sync')
  }

  private async dispatchToExternalEndpoints(
    webhookEvent: WebhookEvent,
    envelope: DomainEventEnvelope<Record<string, unknown>>,
  ): Promise<void> {
    const p = envelope.payload || {}
    const tenantId = String(p.tenantId || '00000000-0000-0000-0000-000000000001')

    try {
      this.logger.log(
        `Relaying event "${webhookEvent}" to registered external webhooks (tenant ${tenantId})`,
      )

      await this.dispatchWebhookHandler.execute(
        new DispatchWebhookEventCommand(
          tenantId,
          webhookEvent,
          {
            ...p,
            eventId: envelope.eventId,
            eventType: webhookEvent,
            occurredOn: envelope.occurredOn || new Date().toISOString(),
          },
        ),
      )
    } catch (error) {
      this.logger.error(`Error relaying webhook event ${webhookEvent}: ${error}`)
    }
  }
}
