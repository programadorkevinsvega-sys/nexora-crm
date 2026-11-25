import { Injectable } from '@nestjs/common'
import { CompanyRepository } from '../../domain/repositories/company.repository'
import { GetCompanyQuery, ListCompaniesQuery } from './company.queries'
import { NotFoundError } from '@crm/shared'

@Injectable()
export class GetCompanyHandler {
  constructor(private readonly repo: CompanyRepository) {}

  async execute(query: GetCompanyQuery) {
    const company = await this.repo.findById(query.tenantId, query.id)
    if (!company) throw new NotFoundError('Company', query.id)
    return company
  }
}

@Injectable()
export class ListCompaniesHandler {
  constructor(private readonly repo: CompanyRepository) {}

  async execute(query: ListCompaniesQuery) {
    return this.repo.list(query.tenantId, query.filter)
  }
}
