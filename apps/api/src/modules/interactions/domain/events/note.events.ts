import { DomainEvent } from '@crm/shared'

export class NoteCreatedEvent extends DomainEvent {
  readonly aggregateType = 'note'
  readonly eventName = 'note.created'

  constructor(readonly aggregateId: string, readonly content: string) {
    super()
  }

  toPrimitives() {
    return { noteId: this.aggregateId, content: this.content }
  }
}

export class NoteUpdatedEvent extends DomainEvent {
  readonly aggregateType = 'note'
  readonly eventName = 'note.updated'

  constructor(readonly aggregateId: string, readonly content: string) {
    super()
  }

  toPrimitives() {
    return { noteId: this.aggregateId, content: this.content }
  }
}

export class NoteDeletedEvent extends DomainEvent {
  readonly aggregateType = 'note'
  readonly eventName = 'note.deleted'

  constructor(readonly aggregateId: string) {
    super()
  }

  toPrimitives() {
    return { noteId: this.aggregateId }
  }
}
