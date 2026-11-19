export class GetPasswordPolicyQuery {
  constructor(readonly tenantId: string) {}
}

export class ListSessionsQuery {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
  ) {}
}

export class ListIpRestrictionsQuery {
  constructor(
    readonly tenantId: string,
    readonly userId?: string,
  ) {}
}

export class ListOAuthProvidersQuery {
  constructor(readonly tenantId: string) {}
}

export class VerifyTokenQuery {
  constructor(readonly token: string) {}
}

export class ListMfaMethodsQuery {
  constructor(
    readonly tenantId: string,
    readonly userId: string,
  ) {}
}
