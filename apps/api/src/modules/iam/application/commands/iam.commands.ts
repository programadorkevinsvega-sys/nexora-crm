export class CreateRoleCommand {
  constructor(
    readonly tenantId: string,
    readonly name: string,
    readonly description?: string,
  ) {}
}

export class UpdateRoleCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
    readonly name?: string,
    readonly description?: string,
  ) {}
}

export class DeleteRoleCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
  ) {}
}

export class CreatePermissionCommand {
  constructor(
    readonly module: string,
    readonly action: string,
    readonly description?: string,
  ) {}
}

export class AssignPermissionCommand {
  constructor(
    readonly roleId: string,
    readonly permissionId: string,
  ) {}
}

export class RemovePermissionCommand {
  constructor(
    readonly roleId: string,
    readonly permissionId: string,
  ) {}
}

export class AssignRoleCommand {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
    readonly roleId: string,
    readonly branchId?: string,
  ) {}
}

export class ReplaceUserRoleCommand {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
    readonly roleId: string,
    readonly branchId?: string,
  ) {}
}

export class RemoveRoleCommand {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
    readonly roleId: string,
  ) {}
}
