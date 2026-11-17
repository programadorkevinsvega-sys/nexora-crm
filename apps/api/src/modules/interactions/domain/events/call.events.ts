import { DomainEvent } from '@crm/shared'

export class CallCreatedEvent extends DomainEvent {
  readonly aggregateType = 'call'
  readonly eventName = 'call.created'

  constructor(
    readonly aggregateId: string,
    readonly callType: string,
    readonly tenantId?: string,
    readonly contactId?: string | null,
    readonly durationSeconds?: number | null,
    readonly summary?: string | null,
    readonly happenedAt?: Date,
  ) {
    super()
  }

  toPrimitives() {
    return {
      callId: this.aggregateId,
      callType: this.callType,
      tenantId: this.tenantId,
      contactId: this.contactId,
      durationSeconds: this.durationSeconds,
      summary: this.summary,
      happenedAt: this.happenedAt?.toISOString(),
    }
  }
}
