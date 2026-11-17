import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { NatsConsumerService, DomainEventEnvelope } from '../../../common/nats/nats-consumer.service'
import { CreateTicketHandler } from '../application/commands/support-ticket.handlers'
import { CreateTicketCommand } from '../application/commands/support-ticket.commands'

@Injectable()
export class SupportTicketsConsumerService implements OnModuleInit {
  private readonly logger = new Logger(SupportTicketsConsumerService.name)

  constructor(
    private readonly natsConsumer: NatsConsumerService,
    private readonly createTicketHandler: CreateTicketHandler,
  ) {}

  async onModuleInit(): Promise<void> {
    const queueGroup = 'support-tickets-social-engine'

    await this.natsConsumer.subscribe(
      'crm.social_inbox.comment_received',
      queueGroup,
      this.handleSocialComment.bind(this),
    )

    await this.natsConsumer.subscribe(
      'crm.social_inbox.comment_created',
      queueGroup,
      this.handleSocialComment.bind(this),
    )

    await this.natsConsumer.subscribe(
      'crm.ai.sentiment_analyzed',
      queueGroup,
      this.handleNegativeSentiment.bind(this),
    )

    this.logger.log('SupportTicketsConsumerService subscribed to social inbox & AI sentiment events')
  }

  private async handleSocialComment(
    envelope: DomainEventEnvelope<Record<string, unknown>>,
  ): Promise<void> {
    const p = envelope.payload || {}
    const message = String(p.message || p.content || '')
    const authorName = String(p.authorName || p.author || 'Usuario Redes')
    const platform = String(p.platform || 'Social')
    const tenantId = String(p.tenantId || '00000000-0000-0000-0000-000000000001')
    const contactId = String(p.contactId || '')

    const isComplaint = this.detectComplaint(message)
    if (!isComplaint) return

    try {
      this.logger.log(`Auto-creating Support Ticket for social complaint on ${platform} from ${authorName}`)
      await this.createTicketHandler.execute(
        new CreateTicketCommand(
          tenantId,
          `[${platform}] Reclamo de ${authorName}`,
          `Mensaje recibido: "${message}"\nPlataforma: ${platform}\nID: ${p.commentId || envelope.eventId}`,
          contactId || undefined,
          'HIGH',
          '00000000-0000-0000-0000-000000000001',
        ),
      )
    } catch (error) {
      this.logger.error(`Failed to auto-create support ticket from social comment: ${error}`)
    }
  }

  private async handleNegativeSentiment(
    envelope: DomainEventEnvelope<Record<string, unknown>>,
  ): Promise<void> {
    const p = envelope.payload || {}
    const sentiment = String(p.sentiment || '')
    const summary = String(p.summary || '')
    const contactId = String(p.contactId || '')
    const tenantId = String(p.tenantId || '00000000-0000-0000-0000-000000000001')

    if (sentiment !== 'NEGATIVE') return

    try {
      this.logger.log(`Auto-creating urgent Support Ticket for negative sentiment on contact ${contactId}`)
      await this.createTicketHandler.execute(
        new CreateTicketCommand(
          tenantId,
          `[Alerta AI] Sentimiento Negativo detectado en Contacto`,
          `Resumen de interacción negativa:\n"${summary}"\nConfianza AI: ${p.confidence || '0.90'}`,
          contactId || undefined,
          'CRITICAL',
          '00000000-0000-0000-0000-000000000001',
        ),
      )
    } catch (error) {
      this.logger.error(`Failed to auto-create urgent ticket from negative sentiment: ${error}`)
    }
  }

  private detectComplaint(text: string): boolean {
    const lower = text.toLowerCase()
    const triggers = ['queja', 'reclamo', 'molesto', 'pésimo', 'falla', 'error', 'estafa', 'cancelar', 'malo', 'horrible']
    return triggers.some((t) => lower.includes(t))
  }
}
