import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common'
import { CreateQuoteHandler, SendQuoteHandler, AcceptQuoteHandler, RejectQuoteHandler } from '../../application/commands/quote.handlers'
import { CreateContractHandler, UpdateContractHandler, RenewContractHandler, UpdateContractStatusHandler } from '../../application/commands/contract.handlers'
import { GetQuoteHandler, ListQuotesHandler } from '../../application/queries/quote.handlers'
import { GetContractHandler, ListContractsHandler } from '../../application/queries/contract.handlers'
import { CreateQuoteCommand, SendQuoteCommand, AcceptQuoteCommand, RejectQuoteCommand } from '../../application/commands/quote.commands'
import { CreateContractCommand, UpdateContractCommand, RenewContractCommand, UpdateContractStatusCommand } from '../../application/commands/contract.commands'
import { GetQuoteQuery, ListQuotesQuery } from '../../application/queries/quote.queries'
import { GetContractQuery, ListContractsQuery } from '../../application/queries/contract.queries'
import { CreateQuoteDto, RejectQuoteDto } from './dto/quote.dto'
import { CreateContractDto, UpdateContractDto, UpdateContractStatusDto } from './dto/contract.dto'
import { TenantId } from '../../../../common/decorators/tenant-id.decorator'
import { QuoteMapper } from '../../infrastructure/quote.mapper'
import { ContractMapper } from '../../infrastructure/contract.mapper'

@Controller()
export class ContractsController {
  constructor(
    private readonly createQuoteHandler: CreateQuoteHandler,
    private readonly sendQuoteHandler: SendQuoteHandler,
    private readonly acceptQuoteHandler: AcceptQuoteHandler,
    private readonly rejectQuoteHandler: RejectQuoteHandler,
    private readonly createContractHandler: CreateContractHandler,
    private readonly updateContractHandler: UpdateContractHandler,
    private readonly renewContractHandler: RenewContractHandler,
    private readonly updateContractStatusHandler: UpdateContractStatusHandler,
    private readonly getQuoteHandler: GetQuoteHandler,
    private readonly listQuotesHandler: ListQuotesHandler,
    private readonly getContractHandler: GetContractHandler,
    private readonly listContractsHandler: ListContractsHandler,
  ) {}

  @Get('quotes')
  async listQuotes(
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('status') status: string | undefined,
    @Query('dealId') dealId: string | undefined,
    @TenantId() tenantId: string,
  ) {
    const result = await this.listQuotesHandler.execute(
      new ListQuotesQuery(tenantId, {
        status,
        dealId,
        cursor,
        limit: Math.min(Number(limit) || 20, 100),
      }),
    )
    return {
      data: result.data.map(QuoteMapper.toResponse),
      nextCursor: result.nextCursor,
    }
  }

  @Post('quotes')
  async createQuote(@Body() dto: CreateQuoteDto, @TenantId() tenantId: string) {
    return this.createQuoteHandler.execute(
      new CreateQuoteCommand(
        tenantId,
        dto.dealId,
        dto.quoteNumber,
        dto.validUntil,
        dto.termsAndConditions,
        dto.subtotal,
        dto.taxTotal,
        dto.grandTotal,
      ),
    )
  }

  @Get('quotes/:id')
  async getQuote(@Param('id') id: string, @TenantId() tenantId: string) {
    const quote = await this.getQuoteHandler.execute(new GetQuoteQuery(tenantId, id))
    return QuoteMapper.toResponse(quote)
  }

  @Put('quotes/:id/send')
  async sendQuote(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.sendQuoteHandler.execute(new SendQuoteCommand(tenantId, id))
    return { id }
  }

  @Put('quotes/:id/accept')
  async acceptQuote(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.acceptQuoteHandler.execute(new AcceptQuoteCommand(tenantId, id))
    return { id }
  }

  @Put('quotes/:id/reject')
  async rejectQuote(@Param('id') id: string, @Body() dto: RejectQuoteDto, @TenantId() tenantId: string) {
    await this.rejectQuoteHandler.execute(new RejectQuoteCommand(tenantId, id, dto.reason))
    return { id }
  }

  @Get('contracts')
  async listContracts(
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('status') status: string | undefined,
    @Query('companyId') companyId: string | undefined,
    @TenantId() tenantId: string,
  ) {
    const result = await this.listContractsHandler.execute(
      new ListContractsQuery(tenantId, {
        status,
        companyId,
        cursor,
        limit: Math.min(Number(limit) || 20, 100),
      }),
    )
    return {
      data: result.data.map(ContractMapper.toResponse),
      nextCursor: result.nextCursor,
    }
  }

  @Post('contracts')
  async createContract(@Body() dto: CreateContractDto, @TenantId() tenantId: string) {
    return this.createContractHandler.execute(
      new CreateContractCommand(
        tenantId,
        dto.companyId,
        dto.dealId,
        dto.name,
        dto.startDate,
        dto.endDate,
        dto.autoRenew,
        dto.mrrValue,
        dto.ownerUserId,
      ),
    )
  }

  @Get('contracts/:id')
  async getContract(@Param('id') id: string, @TenantId() tenantId: string) {
    const contract = await this.getContractHandler.execute(new GetContractQuery(tenantId, id))
    return ContractMapper.toResponse(contract)
  }

  @Put('contracts/:id')
  async updateContract(@Param('id') id: string, @Body() dto: UpdateContractDto, @TenantId() tenantId: string) {
    await this.updateContractHandler.execute(
      new UpdateContractCommand(
        tenantId,
        id,
        dto.name,
        dto.startDate,
        dto.endDate,
        dto.autoRenew,
        dto.mrrValue,
        dto.status as any,
      ),
    )
    return { id }
  }

  @Put('contracts/:id/renew')
  async renewContract(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.renewContractHandler.execute(new RenewContractCommand(tenantId, id))
    return { id }
  }

  @Put('contracts/:id/status')
  async updateContractStatus(@Param('id') id: string, @Body() dto: UpdateContractStatusDto, @TenantId() tenantId: string) {
    await this.updateContractStatusHandler.execute(new UpdateContractStatusCommand(tenantId, id, dto.status))
    return { id }
  }
}
