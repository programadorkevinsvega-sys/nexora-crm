import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { NatsConsumerService, DomainEventEnvelope } from '../../../common/nats/nats-consumer.service'
import { CreateCallHandler } from '../application/commands/interactions.handlers'
import { CreateCallCommand } from '../application/commands/interactions.commands'

@Injectable()
export class InteractionsConsumerService implements OnModuleInit {
  private readonly logger = new Logger(InteractionsConsumerService.name)

  constructor(
    private readonly natsConsumer: NatsConsumerService,
    private readonly createCallHandler: CreateCallHandler,
  ) {}

  async onModuleInit(): Promise<void> {
    const queueGroup = 'interactions-voip-timeline-engine'

    await this.natsConsumer.subscribe(
      'crm.call.completed',
      queueGroup,
      this.handleCallCompleted.bind(this),
    )

    await this.natsConsumer.subscribe(
      'crm.calls.completed',
      queueGroup,
      this.handleCallCompleted.bind(this),
    )

    await this.natsConsumer.subscribe(
      'crm.voip.call_completed',
      queueGroup,
      this.handleCallCompleted.bind(this),
    )

    this.logger.log('InteractionsConsumerService subscribed to VoIP/Call completed events')
  }

  private async handleCallCompleted(
    envelope: DomainEventEnvelope<Record<string, unknown>>,
  ): Promise<void> {
    const p = envelope.payload || {}
    const contactId = String(p.contactId || p.toContactId || '')
    const tenantId = String(p.tenantId || '00000000-0000-0000-0000-000000000001')
    const authorUserId = String(p.authorUserId || p.userId || '00000000-0000-0000-0000-000000000001')
    const durationSeconds = Number(p.durationSeconds || p.duration || 0)
    const summary = String(p.summary || p.notes || p.transcription || 'Llamada VoIP registrada automáticamente')

    try {
      this.logger.log(`Recording interaction timeline call for contact ${contactId || 'unknown'}`)
      await this.createCallHandler.execute(
        new CreateCallCommand(
          tenantId,
          'OUTBOUND',
          new Date(),
          authorUserId,
          contactId || undefined,
          durationSeconds,
          summary,
        ),
      )
    } catch (error) {
      this.logger.error(`Failed to record call interaction: ${error}`)
    }
  }
}
