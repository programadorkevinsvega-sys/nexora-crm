export abstract class DomainEvent {
  abstract aggregateType: string
  abstract aggregateId: string
  abstract eventName: string
  abstract toPrimitives(): Record<string, unknown>
}
