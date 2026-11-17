export class PasswordHistory {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly passwordHash: string,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    userId: string
    passwordHash: string
  }): PasswordHistory {
    return new PasswordHistory(
      crypto.randomUUID(),
      props.userId,
      props.passwordHash,
      new Date(),
    )
  }
}
