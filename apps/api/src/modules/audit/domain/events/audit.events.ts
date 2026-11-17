import { DomainEvent } from '@crm/shared'

export class AuditLogCreatedEvent extends DomainEvent {
  readonly aggregateType = 'audit_log'
  readonly eventName = 'audit_log.created'
  constructor(
    readonly aggregateId: string, readonly tenantId: string | null,
    readonly entityType: string, readonly entityId: string, readonly action: string,
    readonly moduleName: string | null, readonly changedByUserId: string | null,
  ) { super() }
  toPrimitives() {
    return { tenantId: this.tenantId, entityType: this.entityType, entityId: this.entityId,
      action: this.action, moduleName: this.moduleName, changedByUserId: this.changedByUserId }
  }
}
