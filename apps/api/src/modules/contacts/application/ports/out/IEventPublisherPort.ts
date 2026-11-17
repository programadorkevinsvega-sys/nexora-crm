import { DomainEvent } from '@crm/shared'

export const EVENT_PUBLISHER_TOKEN = Symbol('IEventPublisherPort')

export interface IEventPublisherPort {
  publish(event: DomainEvent): Promise<void>
  publishMany(events: DomainEvent[]): Promise<void>
}
