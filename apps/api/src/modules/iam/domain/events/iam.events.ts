import { DomainEvent } from '@crm/shared'

export class RoleCreatedEvent extends DomainEvent {
  readonly aggregateType = 'iam-role'

  constructor(
    readonly aggregateId: string,
    readonly eventName: string,
    readonly tenantId: string,
    readonly name: string,
  ) {
    super()
  }

  toPrimitives() {
    return {
      roleId: this.aggregateId,
      tenantId: this.tenantId,
      name: this.name,
    }
  }
}

export class RoleUpdatedEvent extends DomainEvent {
  readonly aggregateType = 'iam-role'
  readonly eventName = 'iam.role.updated'

  constructor(readonly aggregateId: string) {
    super()
  }
  toPrimitives() { return { roleId: this.aggregateId } }
}

export class RoleDeletedEvent extends DomainEvent {
  readonly aggregateType = 'iam-role'
  readonly eventName = 'iam.role.deleted'

  constructor(readonly aggregateId: string) {
    super()
  }
  toPrimitives() { return { roleId: this.aggregateId } }
}

export class PermissionAssignedEvent extends DomainEvent {
  readonly aggregateType = 'iam-role'
  readonly eventName = 'iam.permission.assigned'

  constructor(
    readonly aggregateId: string,
    readonly permissionId: string,
  ) {
    super()
  }
  toPrimitives() { return { roleId: this.aggregateId, permissionId: this.permissionId } }
}

export class PermissionRemovedEvent extends DomainEvent {
  readonly aggregateType = 'iam-role'
  readonly eventName = 'iam.permission.removed'

  constructor(
    readonly aggregateId: string,
    readonly permissionId: string,
  ) {
    super()
  }
  toPrimitives() { return { roleId: this.aggregateId, permissionId: this.permissionId } }
}

export class UserRoleAssignedEvent extends DomainEvent {
  readonly aggregateType = 'iam-user-role'
  readonly eventName = 'iam.user.role.assigned'

  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly userId: string,
    readonly roleId: string,
  ) {
    super()
  }
  toPrimitives() { return { tenantId: this.tenantId, userId: this.userId, roleId: this.roleId } }
}

export class UserRoleRemovedEvent extends DomainEvent {
  readonly aggregateType = 'iam-user-role'
  readonly eventName = 'iam.user.role.removed'

  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly userId: string,
    readonly roleId: string,
  ) {
    super()
  }
  toPrimitives() { return { tenantId: this.tenantId, userId: this.userId, roleId: this.roleId } }
}
