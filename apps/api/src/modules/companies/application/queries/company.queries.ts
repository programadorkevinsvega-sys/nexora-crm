import { CompanyFilter } from '../../domain/repositories/company.repository'

export class GetCompanyQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListCompaniesQuery {
  constructor(readonly tenantId: string, readonly filter: CompanyFilter) {}
}
