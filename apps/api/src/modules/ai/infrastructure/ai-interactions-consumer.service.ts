import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { NatsConsumerService, DomainEventEnvelope } from '../../../common/nats/nats-consumer.service'
import { OutboxService } from '../../../common/outbox/outbox.service'
import { DomainEvent } from '@crm/shared'

export class SentimentAnalyzedEvent extends DomainEvent {
  readonly aggregateType = 'ai_sentiment'
  readonly eventName = 'ai.sentiment_analyzed'

  constructor(
    readonly aggregateId: string,
    readonly contactId: string,
    readonly sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE',
    readonly confidence: number,
    readonly summary: string,
  ) {
    super()
  }

  toPrimitives() {
    return {
      interactionId: this.aggregateId,
      contactId: this.contactId,
      sentiment: this.sentiment,
      confidence: this.confidence,
      summary: this.summary,
    }
  }
}

@Injectable()
export class AiInteractionsConsumerService implements OnModuleInit {
  private readonly logger = new Logger(AiInteractionsConsumerService.name)

  constructor(
    private readonly natsConsumer: NatsConsumerService,
    private readonly outbox: OutboxService,
  ) {}

  async onModuleInit(): Promise<void> {
    const queueGroup = 'ai-interactions-sentiment-engine'

    await this.natsConsumer.subscribe(
      'crm.call.created',
      queueGroup,
      this.handleInteractionSentiment.bind(this),
    )

    await this.natsConsumer.subscribe(
      'crm.call.completed',
      queueGroup,
      this.handleInteractionSentiment.bind(this),
    )

    await this.natsConsumer.subscribe(
      'crm.note.created',
      queueGroup,
      this.handleInteractionSentiment.bind(this),
    )

    this.logger.log('AiInteractionsConsumerService subscribed to call and note interactions for sentiment analysis')
  }

  private async handleInteractionSentiment(
    envelope: DomainEventEnvelope<Record<string, unknown>>,
  ): Promise<void> {
    const p = envelope.payload || {}
    const text = String(p.summary || p.content || p.notes || '')
    const contactId = String(p.contactId || '')
    const interactionId = String(p.callId || p.noteId || p.id || envelope.aggregateId || '')

    if (!text || !contactId) return

    try {
      this.logger.log(`Analyzing AI sentiment for interaction ${interactionId} (contact ${contactId})`)
      const sentiment = this.evaluateSentiment(text)

      await this.outbox.publish(
        new SentimentAnalyzedEvent(
          interactionId,
          contactId,
          sentiment.sentiment,
          sentiment.confidence,
          text.slice(0, 300),
        ),
      )
    } catch (error) {
      this.logger.error(`Error analyzing sentiment for interaction ${interactionId}: ${error}`)
    }
  }

  private evaluateSentiment(text: string): { sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'; confidence: number } {
    const lower = text.toLowerCase()
    const negativeKeywords = ['molesto', 'enojado', 'cancelar', 'queja', 'malo', 'pésimo', 'falla', 'error', 'terrible', 'problema']
    const positiveKeywords = ['excelente', 'gracias', 'satisfecho', 'comprar', 'cerrado', 'ganado', 'perfecto', 'bueno', 'interesado']

    const hasNegative = negativeKeywords.some((k) => lower.includes(k))
    const hasPositive = positiveKeywords.some((k) => lower.includes(k))

    if (hasNegative && !hasPositive) {
      return { sentiment: 'NEGATIVE', confidence: 0.88 }
    }
    if (hasPositive && !hasNegative) {
      return { sentiment: 'POSITIVE', confidence: 0.92 }
    }
    return { sentiment: 'NEUTRAL', confidence: 0.75 }
  }
}
