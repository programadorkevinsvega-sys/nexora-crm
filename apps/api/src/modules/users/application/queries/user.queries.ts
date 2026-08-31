import { UserFilter } from '../../domain/repositories/user.repository'

export class GetUserQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class FindByEmailQuery {
  constructor(readonly tenantId: string, readonly email: string) {}
}

export class ListUsersQuery {
  constructor(readonly tenantId: string, readonly filter: UserFilter) {}
}

export class GetProfileQuery {
  constructor(readonly tenantId: string, readonly userId: string) {}
}

export class ListOAuthLinksQuery {
  constructor(readonly userId: string) {}
}

export class ListDevicesQuery {
  constructor(readonly userId: string) {}
}
