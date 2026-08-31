export class OAuthProvider {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly providerName: string,
    readonly clientId: string,
    readonly clientSecret: string,
    readonly isActive: boolean,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    providerName: string
    clientId: string
    clientSecret: string
  }): OAuthProvider {
    return new OAuthProvider(
      crypto.randomUUID(),
      props.tenantId,
      props.providerName,
      props.clientId,
      props.clientSecret,
      true,
      new Date(),
    )
  }

  deactivate(): OAuthProvider {
    return new OAuthProvider(
      this.id, this.tenantId, this.providerName,
      this.clientId, this.clientSecret, false, this.createdAt,
    )
  }
}
