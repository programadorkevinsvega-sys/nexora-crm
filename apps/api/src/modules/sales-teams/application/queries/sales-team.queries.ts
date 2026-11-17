import { SalesTeamFilter } from '../../domain/repositories/sales-team.repository'
import { SalesQuotaFilter } from '../../domain/repositories/sales-quota.repository'

export class GetTeamQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListTeamsQuery {
  constructor(readonly tenantId: string, readonly filter: SalesTeamFilter) {}
}

export class GetTeamMembersQuery {
  constructor(readonly tenantId: string, readonly teamId: string) {}
}

export class GetQuotaQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListQuotasQuery {
  constructor(
    readonly tenantId: string,
    readonly teamId: string,
    readonly filter: SalesQuotaFilter,
  ) {}
}
