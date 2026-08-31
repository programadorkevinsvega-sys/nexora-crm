import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { CreateCompanySchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { CompaniesBffService, CompanyFilters, PaginatedResult } from './companies.bff.service'
import type { CreateCompany, UpdateCompany, Company } from '@crm/contracts'

@Controller('api/companies')
export class CompaniesBffController {
  constructor(private readonly service: CompaniesBffService) {}

  @Get()
  async list(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('industry') industry?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Company>> {
    const filters: CompanyFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      search,
      industry,
    }
    return this.service.list(filters, tenantId!)
  }

  @Post()
  async create(
    @Body(createZodPipe(CreateCompanySchema)) dto: CreateCompany,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Company> {
    return this.service.create(dto, tenantId!)
  }

  @Get(':id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Company> {
    return this.service.getById(id, tenantId!)
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompany,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Company> {
    return this.service.update(id, dto, tenantId!)
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.delete(id, tenantId!)
  }
}
