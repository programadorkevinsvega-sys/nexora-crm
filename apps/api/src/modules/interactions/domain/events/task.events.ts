import { DomainEvent } from '@crm/shared'

export class TaskCreatedEvent extends DomainEvent {
  readonly aggregateType = 'task'
  readonly eventName = 'task.created'

  constructor(readonly aggregateId: string, readonly title: string, readonly assignedUserId: string) {
    super()
  }

  toPrimitives() {
    return { taskId: this.aggregateId, title: this.title, assignedUserId: this.assignedUserId }
  }
}

export class TaskUpdatedEvent extends DomainEvent {
  readonly aggregateType = 'task'
  readonly eventName = 'task.updated'

  constructor(readonly aggregateId: string, readonly title: string, readonly isCompleted: boolean) {
    super()
  }

  toPrimitives() {
    return { taskId: this.aggregateId, title: this.title, isCompleted: this.isCompleted }
  }
}

export class TaskCompletedEvent extends DomainEvent {
  readonly aggregateType = 'task'
  readonly eventName = 'task.completed'

  constructor(readonly aggregateId: string, readonly title: string) {
    super()
  }

  toPrimitives() {
    return { taskId: this.aggregateId, title: this.title }
  }
}

export class TaskDeletedEvent extends DomainEvent {
  readonly aggregateType = 'task'
  readonly eventName = 'task.deleted'

  constructor(readonly aggregateId: string) {
    super()
  }

  toPrimitives() {
    return { taskId: this.aggregateId }
  }
}
