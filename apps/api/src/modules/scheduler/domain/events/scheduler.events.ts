import { DomainEvent } from '@crm/shared'

export class TaskCreatedEvent extends DomainEvent {
  readonly aggregateType = 'scheduled_task'
  readonly eventName = 'scheduled_task.created'
  constructor(readonly aggregateId: string, readonly tenantId: string | null, readonly name: string, readonly taskType: string, readonly cronExpression: string) { super() }
  toPrimitives() { return { tenantId: this.tenantId, name: this.name, taskType: this.taskType, cronExpression: this.cronExpression } }
}
export class TaskUpdatedEvent extends DomainEvent {
  readonly aggregateType = 'scheduled_task'
  readonly eventName = 'scheduled_task.updated'
  constructor(readonly aggregateId: string, readonly tenantId: string | null, readonly name: string, readonly enabled: boolean) { super() }
  toPrimitives() { return { tenantId: this.tenantId, name: this.name, enabled: this.enabled } }
}
export class TaskDeletedEvent extends DomainEvent {
  readonly aggregateType = 'scheduled_task'
  readonly eventName = 'scheduled_task.deleted'
  constructor(readonly aggregateId: string, readonly tenantId: string | null, readonly name: string) { super() }
  toPrimitives() { return { tenantId: this.tenantId, name: this.name } }
}
export class TaskExecutedEvent extends DomainEvent {
  readonly aggregateType = 'task_execution'
  readonly eventName = 'task_execution.completed'
  constructor(readonly aggregateId: string, readonly taskId: string, readonly tenantId: string | null, readonly status: string) { super() }
  toPrimitives() { return { taskId: this.taskId, tenantId: this.tenantId, status: this.status } }
}
export class ReminderCreatedEvent extends DomainEvent {
  readonly aggregateType = 'reminder'
  readonly eventName = 'reminder.created'
  constructor(readonly aggregateId: string, readonly userId: string, readonly title: string, readonly remindAt: Date) { super() }
  toPrimitives() { return { userId: this.userId, title: this.title, remindAt: this.remindAt.toISOString() } }
}
export class SlaViolationDetectedEvent extends DomainEvent {
  readonly aggregateType = 'sla_violation'
  readonly eventName = 'sla_violation.detected'
  constructor(readonly aggregateId: string, readonly slaConfigId: string, readonly tenantId: string, readonly entityType: string, readonly entityId: string) { super() }
  toPrimitives() { return { slaConfigId: this.slaConfigId, tenantId: this.tenantId, entityType: this.entityType, entityId: this.entityId } }
}
