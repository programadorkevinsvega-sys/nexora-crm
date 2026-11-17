export class Session {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly userId: string,
    readonly refreshTokenHash: string,
    readonly ipAddress: string | null,
    readonly userAgent: string | null,
    readonly deviceId: string | null,
    readonly expiresAt: Date,
    readonly isRevoked: boolean,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    userId: string
    refreshTokenHash: string
    ipAddress?: string
    userAgent?: string
    deviceId?: string
    expiresAt: Date
  }): Session {
    return new Session(
      crypto.randomUUID(),
      props.tenantId,
      props.userId,
      props.refreshTokenHash,
      props.ipAddress ?? null,
      props.userAgent ?? null,
      props.deviceId ?? null,
      props.expiresAt,
      false,
      new Date(),
    )
  }

  revoke(): Session {
    return new Session(
      this.id, this.tenantId, this.userId, this.refreshTokenHash,
      this.ipAddress, this.userAgent, this.deviceId,
      this.expiresAt, true, this.createdAt,
    )
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt
  }
}
