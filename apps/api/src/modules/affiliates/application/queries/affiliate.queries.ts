import { ProgramFilter } from '../../domain/repositories/affiliate-program.repository'
import { AffiliateFilter } from '../../domain/repositories/affiliate.repository'
import { CommissionFilter, PayoutFilter } from '../../domain/repositories/commission.repository'

export class GetProgramQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListProgramsQuery {
  constructor(readonly tenantId: string, readonly filter: ProgramFilter) {}
}

export class GetAffiliateQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListAffiliatesQuery {
  constructor(readonly tenantId: string, readonly filter: AffiliateFilter) {}
}

export class GetCommissionsQuery {
  constructor(readonly tenantId: string, readonly filter: CommissionFilter) {}
}

export class GetPayoutsQuery {
  constructor(readonly tenantId: string, readonly filter: PayoutFilter) {}
}
