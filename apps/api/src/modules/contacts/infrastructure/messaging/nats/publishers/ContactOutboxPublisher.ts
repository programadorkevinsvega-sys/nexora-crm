import { Injectable } from '@nestjs/common'
import { DomainEvent } from '@crm/shared'
import { IEventPublisherPort } from '../../../../application/ports/out/IEventPublisherPort'
import { OutboxService } from '../../../../../../common/outbox/outbox.service'

@Injectable()
export class ContactOutboxPublisher implements IEventPublisherPort {
  constructor(private readonly outboxService: OutboxService) {}

  async publish(event: DomainEvent): Promise<void> {
    await this.outboxService.publish(event)
  }

  async publishMany(events: DomainEvent[]): Promise<void> {
    await this.outboxService.publishMany(events)
  }
}
