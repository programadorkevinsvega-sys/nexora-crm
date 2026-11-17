export type RestrictionType = 'ALLOW' | 'DENY'

export class IpRestriction {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly userId: string | null,
    readonly ipAddress: string,
    readonly type: RestrictionType,
    readonly description: string | null,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    userId?: string
    ipAddress: string
    type: RestrictionType
    description?: string
  }): IpRestriction {
    return new IpRestriction(
      crypto.randomUUID(),
      props.tenantId,
      props.userId ?? null,
      props.ipAddress,
      props.type,
      props.description ?? null,
      new Date(),
    )
  }
}
