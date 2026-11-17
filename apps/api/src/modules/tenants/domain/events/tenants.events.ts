import { DomainEvent } from '@crm/shared'

export class TenantCreatedEvent extends DomainEvent {
  readonly aggregateType = 'tenant'
  constructor(
    readonly aggregateId: string,
    readonly eventName: string,
    readonly name: string,
    readonly ownerUserId: string,
  ) {
    super()
  }
  toPrimitives() { return { tenantId: this.aggregateId, name: this.name, ownerUserId: this.ownerUserId } }
}

export class TenantUpdatedEvent extends DomainEvent {
  readonly aggregateType = 'tenant'
  readonly eventName = 'tenant.updated'
  constructor(readonly aggregateId: string) { super() }
  toPrimitives() { return { tenantId: this.aggregateId } }
}

export class TenantDeletedEvent extends DomainEvent {
  readonly aggregateType = 'tenant'
  readonly eventName = 'tenant.deleted'
  constructor(readonly aggregateId: string) { super() }
  toPrimitives() { return { tenantId: this.aggregateId } }
}

export class BranchCreatedEvent extends DomainEvent {
  readonly aggregateType = 'tenant-branch'
  readonly eventName = 'tenant.branch.created'
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
  ) { super() }
  toPrimitives() { return { branchId: this.aggregateId, tenantId: this.tenantId } }
}

export class BranchUpdatedEvent extends DomainEvent {
  readonly aggregateType = 'tenant-branch'
  readonly eventName = 'tenant.branch.updated'
  constructor(readonly aggregateId: string) { super() }
  toPrimitives() { return { branchId: this.aggregateId } }
}

export class BranchDeletedEvent extends DomainEvent {
  readonly aggregateType = 'tenant-branch'
  readonly eventName = 'tenant.branch.deleted'
  constructor(readonly aggregateId: string) { super() }
  toPrimitives() { return { branchId: this.aggregateId } }
}

export class ModuleInstalledEvent extends DomainEvent {
  readonly aggregateType = 'tenant-module'
  readonly eventName = 'tenant.module.installed'
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly moduleId: string,
  ) { super() }
  toPrimitives() { return { tenantId: this.tenantId, moduleId: this.moduleId } }
}

export class ModuleUninstalledEvent extends DomainEvent {
  readonly aggregateType = 'tenant-module'
  readonly eventName = 'tenant.module.uninstalled'
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly moduleId: string,
  ) { super() }
  toPrimitives() { return { tenantId: this.tenantId, moduleId: this.moduleId } }
}
