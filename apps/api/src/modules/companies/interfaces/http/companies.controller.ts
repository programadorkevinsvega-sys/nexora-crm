import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { CreateCompanyHandler, UpdateCompanyHandler, DeleteCompanyHandler } from '../../application/commands/company.handlers'
import { GetCompanyHandler, ListCompaniesHandler } from '../../application/queries/company.handlers'
import { CreateCompanyCommand, UpdateCompanyCommand, DeleteCompanyCommand } from '../../application/commands/company.commands'
import { GetCompanyQuery, ListCompaniesQuery } from '../../application/queries/company.queries'
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto'
import { TenantId } from '../../../../common/decorators/tenant-id.decorator'
import { CompanyMapper } from '../../infrastructure/company.mapper'

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly createHandler: CreateCompanyHandler,
    private readonly updateHandler: UpdateCompanyHandler,
    private readonly deleteHandler: DeleteCompanyHandler,
    private readonly getHandler: GetCompanyHandler,
    private readonly listHandler: ListCompaniesHandler,
  ) {}

  @Post()
  async create(@Body() dto: CreateCompanyDto, @TenantId() tenantId: string) {
    const result = await this.createHandler.execute(
      new CreateCompanyCommand(tenantId, dto.name, dto.taxId, dto.website, dto.industry, dto.numberOfEmployees, dto.annualRevenue, dto.description, dto.parentCompanyId),
    )
    return result
  }

  @Get()
  async list(
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('search') search: string | undefined,
    @Query('industry') industry: string | undefined,
    @TenantId() tenantId: string,
  ) {
    const result = await this.listHandler.execute(
      new ListCompaniesQuery(tenantId, {
        search,
        industry,
        cursor,
        limit: Math.min(Number(limit) || 20, 100),
      }),
    )
    return {
      data: result.data.map(CompanyMapper.toResponse),
      nextCursor: result.nextCursor,
    }
  }

  @Get(':id')
  async get(@Param('id') id: string, @TenantId() tenantId: string) {
    const company = await this.getHandler.execute(new GetCompanyQuery(tenantId, id))
    return CompanyMapper.toResponse(company)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCompanyDto, @TenantId() tenantId: string) {
    await this.updateHandler.execute(
      new UpdateCompanyCommand(tenantId, id, dto.name, dto.taxId, dto.website, dto.industry, dto.numberOfEmployees, dto.annualRevenue, dto.description, dto.parentCompanyId),
    )
    return { id }
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.deleteHandler.execute(new DeleteCompanyCommand(tenantId, id))
    return { id }
  }
}
