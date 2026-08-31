export type MfaType = 'TOTP' | 'SMS' | 'EMAIL'

export class MfaMethod {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly userId: string,
    readonly type: MfaType,
    readonly secret: string,
    readonly isPrimary: boolean,
    readonly isActive: boolean,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    userId: string
    type: MfaType
    secret: string
    isPrimary?: boolean
  }): MfaMethod {
    return new MfaMethod(
      crypto.randomUUID(),
      props.tenantId,
      props.userId,
      props.type,
      props.secret,
      props.isPrimary ?? false,
      true,
      new Date(),
    )
  }

  setPrimary(): MfaMethod {
    return new MfaMethod(
      this.id, this.tenantId, this.userId, this.type,
      this.secret, true, this.isActive, this.createdAt,
    )
  }

  deactivate(): MfaMethod {
    return new MfaMethod(
      this.id, this.tenantId, this.userId, this.type,
      this.secret, false, false, this.createdAt,
    )
  }
}
