export class Role {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly description: string | null,
    readonly isSystemRole: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    name: string
    description?: string
    isSystemRole?: boolean
  }): Role {
    return new Role(
      crypto.randomUUID(),
      props.tenantId,
      props.name,
      props.description ?? null,
      props.isSystemRole ?? false,
      new Date(),
      new Date(),
    )
  }

  update(props: { name?: string; description?: string }): Role {
    return new Role(
      this.id, this.tenantId,
      props.name ?? this.name,
      props.description !== undefined ? props.description : this.description,
      this.isSystemRole,
      this.createdAt,
      new Date(),
    )
  }
}
