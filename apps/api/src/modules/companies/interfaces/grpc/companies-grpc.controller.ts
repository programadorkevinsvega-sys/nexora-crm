import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { CreateCompanyHandler, UpdateCompanyHandler, DeleteCompanyHandler } from '../../application/commands/company.handlers'
import { GetCompanyHandler, ListCompaniesHandler } from '../../application/queries/company.handlers'
import { CreateCompanyCommand, UpdateCompanyCommand, DeleteCompanyCommand } from '../../application/commands/company.commands'
import { GetCompanyQuery, ListCompaniesQuery } from '../../application/queries/company.queries'
import { CompanyMapper } from '../../infrastructure/company.mapper'

@Controller()
export class CompaniesGrpcController {
  constructor(
    private readonly createHandler: CreateCompanyHandler,
    private readonly updateHandler: UpdateCompanyHandler,
    private readonly deleteHandler: DeleteCompanyHandler,
    private readonly getHandler: GetCompanyHandler,
    private readonly listHandler: ListCompaniesHandler,
  ) {}

  @GrpcMethod('CompanyService', 'CreateCompany')
  async create(data: {
    tenantId: string
    name: string
    taxId?: string
    website?: string
    industry?: string
    numberOfEmployees?: number
    annualRevenue?: number
    description?: string
    parentCompanyId?: string
  }) {
    const result = await this.createHandler.execute(
      new CreateCompanyCommand(
        data.tenantId, data.name,
        data.taxId, data.website, data.industry,
        data.numberOfEmployees, data.annualRevenue,
        data.description, data.parentCompanyId,
      ),
    )
    const company = await this.getHandler.execute(
      new GetCompanyQuery(data.tenantId, result.id),
    )
    return { json: JSON.stringify(CompanyMapper.toResponse(company)) }
  }

  @GrpcMethod('CompanyService', 'GetCompany')
  async getById(data: { tenantId: string; id: string }) {
    const company = await this.getHandler.execute(
      new GetCompanyQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(CompanyMapper.toResponse(company)) }
  }

  @GrpcMethod('CompanyService', 'ListCompanies')
  async list(data: {
    tenantId: string
    cursor?: string
    limit?: number
    search?: string
    industry?: string
  }) {
    const result = await this.listHandler.execute(
      new ListCompaniesQuery(data.tenantId, {
        search: data.search,
        industry: data.industry,
        cursor: data.cursor,
        limit: Math.min(data.limit || 20, 100),
      }),
    )
    return {
      jsonItems: result.data.map(c => JSON.stringify(CompanyMapper.toResponse(c))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('CompanyService', 'UpdateCompany')
  async update(data: {
    tenantId: string
    id: string
    name?: string
    taxId?: string
    website?: string
    industry?: string
    numberOfEmployees?: number
    annualRevenue?: number
    description?: string
    parentCompanyId?: string
  }) {
    await this.updateHandler.execute(
      new UpdateCompanyCommand(
        data.tenantId, data.id,
        data.name, data.taxId, data.website, data.industry,
        data.numberOfEmployees, data.annualRevenue,
        data.description, data.parentCompanyId,
      ),
    )
    return {}
  }

  @GrpcMethod('CompanyService', 'DeleteCompany')
  async delete(data: { tenantId: string; id: string }) {
    await this.deleteHandler.execute(
      new DeleteCompanyCommand(data.tenantId, data.id),
    )
    return {}
  }
}
