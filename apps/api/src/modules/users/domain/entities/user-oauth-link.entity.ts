export class UserOAuthLink {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly providerName: string,
    readonly providerUserId: string,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    userId: string
    providerName: string
    providerUserId: string
  }): UserOAuthLink {
    return new UserOAuthLink(
      crypto.randomUUID(),
      props.userId,
      props.providerName,
      props.providerUserId,
      new Date(),
    )
  }
}
