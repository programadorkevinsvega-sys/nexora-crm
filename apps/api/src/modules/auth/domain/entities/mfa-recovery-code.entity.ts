export class MfaRecoveryCode {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly codeHash: string,
    readonly isUsed: boolean,
    readonly usedAt: Date | null,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    userId: string
    codeHash: string
  }): MfaRecoveryCode {
    return new MfaRecoveryCode(
      crypto.randomUUID(),
      props.userId,
      props.codeHash,
      false,
      null,
      new Date(),
    )
  }

  markAsUsed(): MfaRecoveryCode {
    return new MfaRecoveryCode(
      this.id, this.userId, this.codeHash,
      true, new Date(), this.createdAt,
    )
  }
}
