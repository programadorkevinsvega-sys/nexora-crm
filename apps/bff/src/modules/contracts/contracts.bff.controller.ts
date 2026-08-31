import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Query,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { z } from 'zod'
import {
  CreateQuoteSchema,
  CreateContractSchema,
} from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { ContractsBffService, QuoteFilters, ContractFilters, PaginatedResult } from './contracts.bff.service'
import type { CreateQuote, Quote, CreateContract, Contract } from '@crm/contracts'

const RejectQuoteBodySchema = z.object({
  reason: z.string().min(1),
})

const UpdateContractStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'RENEWED']),
})

@Controller('api')
export class ContractsBffController {
  constructor(private readonly service: ContractsBffService) {}

  @Get('quotes')
  async listQuotes(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('dealId') dealId?: string,
    @Query('status') status?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Quote>> {
    const filters: QuoteFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      dealId,
      status,
    }
    return this.service.listQuotes(filters, tenantId!)
  }

  @Post('quotes')
  async createQuote(
    @Body(createZodPipe(CreateQuoteSchema)) dto: CreateQuote,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Quote> {
    return this.service.createQuote(dto, tenantId!)
  }

  @Get('quotes/:id')
  async getQuote(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Quote> {
    return this.service.getQuote(id, tenantId!)
  }

  @Post('quotes/:id/send')
  async sendQuote(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Quote> {
    return this.service.sendQuote(id, tenantId!)
  }

  @Post('quotes/:id/accept')
  async acceptQuote(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Quote> {
    return this.service.acceptQuote(id, tenantId!)
  }

  @Post('quotes/:id/reject')
  async rejectQuote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(RejectQuoteBodySchema)) dto: { reason: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Quote> {
    return this.service.rejectQuote(id, dto.reason, tenantId!)
  }

  @Get('contracts')
  async listContracts(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Contract>> {
    const filters: ContractFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      companyId,
      status,
    }
    return this.service.listContracts(filters, tenantId!)
  }

  @Post('contracts')
  async createContract(
    @Body(createZodPipe(CreateContractSchema)) dto: CreateContract,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Contract> {
    return this.service.createContract(dto, tenantId!)
  }

  @Get('contracts/:id')
  async getContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Contract> {
    return this.service.getContract(id, tenantId!)
  }

  @Put('contracts/:id')
  async updateContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateContract>,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Contract> {
    return this.service.updateContract(id, dto, tenantId!)
  }

  @Post('contracts/:id/renew')
  async renewContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Contract> {
    return this.service.renewContract(id, tenantId!)
  }

  @Patch('contracts/:id/status')
  async updateContractStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(UpdateContractStatusSchema)) dto: { status: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Contract> {
    return this.service.updateContractStatus(id, dto.status, tenantId!)
  }
}
