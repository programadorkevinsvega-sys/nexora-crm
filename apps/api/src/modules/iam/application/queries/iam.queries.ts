export class GetRoleQuery {
  constructor(readonly id: string) {}
}

export class ListRolesQuery {
  constructor(
    readonly tenantId: string,
    readonly search?: string,
    readonly cursor?: string,
    readonly limit?: number,
  ) {}
}

export class ListPermissionsQuery {
  constructor(readonly module?: string) {}
}

export class ListRolePermissionsQuery {
  constructor(readonly roleId: string) {}
}

export class ListUserRolesQuery {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
  ) {}
}

export class CheckPermissionQuery {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
    readonly module: string,
    readonly action: string,
    readonly branchId?: string,
  ) {}
}

export class GetUserPermissionsQuery {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
  ) {}
}
