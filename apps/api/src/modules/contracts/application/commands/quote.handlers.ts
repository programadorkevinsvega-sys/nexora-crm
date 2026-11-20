import { Injectable } from '@nestjs/common'
import { QuoteRepository } from '../../domain/repositories/quote.repository'
import { Quote } from '../../domain/entities/quote.entity'
import { CreateQuoteCommand, SendQuoteCommand, AcceptQuoteCommand, RejectQuoteCommand } from './quote.commands'
import { QuoteCreatedEvent, QuoteSentEvent, QuoteAcceptedEvent, QuoteRejectedEvent } from '../../domain/events/quote.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { NotFoundError, ConflictError } from '@crm/shared'

@Injectable()
export class CreateQuoteHandler {
  constructor(
    private readonly repo: QuoteRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateQuoteCommand): Promise<{ id: string }> {
    const quote = Quote.create({
      tenantId: command.tenantId,
      dealId: command.dealId,
      quoteNumber: command.quoteNumber,
      validUntil: command.validUntil,
      termsAndConditions: command.termsAndConditions,
      subtotal: command.subtotal ?? 0,
      taxTotal: command.taxTotal ?? 0,
      grandTotal: command.grandTotal ?? 0,
    })

    await this.repo.save(quote)
    await this.outbox.publish(new QuoteCreatedEvent(quote.id, quote.quoteNumber, quote.dealId))

    return { id: quote.id }
  }
}

@Injectable()
export class SendQuoteHandler {
  constructor(
    private readonly repo: QuoteRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: SendQuoteCommand): Promise<void> {
    const quote = await this.repo.findById(command.tenantId, command.id)
    if (!quote) throw new NotFoundError('Quote', command.id)
    if (quote.status !== 'DRAFT') throw new ConflictError('Only draft quotes can be sent')

    const updated = quote.updateStatus('SENT')
    await this.repo.save(updated)
    await this.outbox.publish(new QuoteSentEvent(updated.id))
  }
}

@Injectable()
export class AcceptQuoteHandler {
  constructor(
    private readonly repo: QuoteRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: AcceptQuoteCommand): Promise<void> {
    const quote = await this.repo.findById(command.tenantId, command.id)
    if (!quote) throw new NotFoundError('Quote', command.id)
    if (quote.status !== 'SENT') throw new ConflictError('Only sent quotes can be accepted')

    const updated = quote.updateStatus('ACCEPTED')
    await this.repo.save(updated)
    await this.outbox.publish(new QuoteAcceptedEvent(updated.id, command.actorId, command.actorType))
  }
}

@Injectable()
export class RejectQuoteHandler {
  constructor(
    private readonly repo: QuoteRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: RejectQuoteCommand): Promise<void> {
    const quote = await this.repo.findById(command.tenantId, command.id)
    if (!quote) throw new NotFoundError('Quote', command.id)
    if (quote.status !== 'SENT') throw new ConflictError('Only sent quotes can be rejected')

    const updated = quote.updateStatus('REJECTED')
    await this.repo.save(updated)
    await this.outbox.publish(new QuoteRejectedEvent(updated.id, command.reason, command.actorId, command.actorType))
  }
}
