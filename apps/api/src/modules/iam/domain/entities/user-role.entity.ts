export class UserRole {
  constructor(
    readonly userId: string,
    readonly roleId: string,
    readonly tenantId: string,
    readonly branchId: string | null,
    readonly grantedAt: Date,
  ) {}

  static create(props: {
    userId: string
    roleId: string
    tenantId: string
    branchId?: string
  }): UserRole {
    return new UserRole(
      props.userId,
      props.roleId,
      props.tenantId,
      props.branchId ?? null,
      new Date(),
    )
  }
}
