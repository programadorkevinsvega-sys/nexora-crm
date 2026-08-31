import { DomainEvent } from '@crm/shared'

export class CallCreatedEvent extends DomainEvent {
  readonly aggregateType = 'call'
  readonly eventName = 'call.created'

  constructor(readonly aggregateId: string, readonly callType: string) {
    super()
  }

  toPrimitives() {
    return { callId: this.aggregateId, callType: this.callType }
  }
}
