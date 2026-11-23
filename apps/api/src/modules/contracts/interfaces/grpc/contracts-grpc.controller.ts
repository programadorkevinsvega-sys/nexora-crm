import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { CreateQuoteHandler, SendQuoteHandler, AcceptQuoteHandler, RejectQuoteHandler } from '../../application/commands/quote.handlers'
import { CreateContractHandler, UpdateContractHandler, RenewContractHandler, UpdateContractStatusHandler } from '../../application/commands/contract.handlers'
import { GetQuoteHandler, ListQuotesHandler } from '../../application/queries/quote.handlers'
import { GetContractHandler, ListContractsHandler } from '../../application/queries/contract.handlers'
import { CreateQuoteCommand, SendQuoteCommand, AcceptQuoteCommand, RejectQuoteCommand } from '../../application/commands/quote.commands'
import { CreateContractCommand, UpdateContractCommand, RenewContractCommand, UpdateContractStatusCommand } from '../../application/commands/contract.commands'
import { GetQuoteQuery, ListQuotesQuery } from '../../application/queries/quote.queries'
import { GetContractQuery, ListContractsQuery } from '../../application/queries/contract.queries'
import { QuoteMapper } from '../../infrastructure/quote.mapper'
import { ContractMapper } from '../../infrastructure/contract.mapper'
import { ContractStatus } from '../../domain/entities/contract.entity'

@Controller()
export class ContractsGrpcController {
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

  // ─── QuoteService ───────────────────────────────────────────────

  @GrpcMethod('QuoteService', 'CreateQuote')
  async createQuote(data: {
    tenantId: string
    dealId?: string | null
    quoteNumber: string
    validUntil: string
    termsAndConditions?: string | null
    subtotal?: number
    taxTotal?: number
    grandTotal?: number
  }) {
    const result = await this.createQuoteHandler.execute(
      new CreateQuoteCommand(
        data.tenantId, data.dealId, data.quoteNumber,
        data.validUntil, data.termsAndConditions,
        data.subtotal, data.taxTotal, data.grandTotal,
      ),
    )
    const quote = await this.getQuoteHandler.execute(
      new GetQuoteQuery(data.tenantId, result.id),
    )
    return { json: JSON.stringify(QuoteMapper.toResponse(quote)) }
  }

  @GrpcMethod('QuoteService', 'GetQuote')
  async getQuoteById(data: { tenantId: string; id: string }) {
    const quote = await this.getQuoteHandler.execute(
      new GetQuoteQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(QuoteMapper.toResponse(quote)) }
  }

  @GrpcMethod('QuoteService', 'ListQuotes')
  async listQuotes(data: {
    tenantId: string
    cursor?: string
    limit?: number
    status?: string
    dealId?: string
  }) {
    const result = await this.listQuotesHandler.execute(
      new ListQuotesQuery(data.tenantId, {
        status: data.status,
        dealId: data.dealId,
        cursor: data.cursor,
        limit: Math.min(data.limit || 20, 100),
      }),
    )
    return {
      jsonItems: result.data.map(q => JSON.stringify(QuoteMapper.toResponse(q))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('QuoteService', 'SendQuote')
  async sendQuote(data: { tenantId: string; id: string }) {
    await this.sendQuoteHandler.execute(
      new SendQuoteCommand(data.tenantId, data.id),
    )
    return {}
  }

  @GrpcMethod('QuoteService', 'AcceptQuote')
  async acceptQuote(data: { tenantId: string; id: string; actorId?: string; actorType?: string }) {
    await this.acceptQuoteHandler.execute(
      new AcceptQuoteCommand(data.tenantId, data.id, data.actorId, data.actorType),
    )
    return {}
  }

  @GrpcMethod('QuoteService', 'RejectQuote')
  async rejectQuote(data: { tenantId: string; id: string; reason: string; actorId?: string; actorType?: string }) {
    await this.rejectQuoteHandler.execute(
      new RejectQuoteCommand(data.tenantId, data.id, data.reason, data.actorId, data.actorType),
    )
    return {}
  }

  // ─── ContractService ────────────────────────────────────────────

  @GrpcMethod('ContractService', 'CreateContract')
  async createContract(data: {
    tenantId: string
    companyId: string
    dealId?: string
    name: string
    startDate: string
    endDate?: string
    autoRenew?: boolean
    mrrValue?: number
    ownerUserId: string
  }) {
    const result = await this.createContractHandler.execute(
      new CreateContractCommand(
        data.tenantId, data.companyId, data.dealId,
        data.name, data.startDate, data.endDate,
        data.autoRenew, data.mrrValue, data.ownerUserId,
      ),
    )
    const contract = await this.getContractHandler.execute(
      new GetContractQuery(data.tenantId, result.id),
    )
    return { json: JSON.stringify(ContractMapper.toResponse(contract)) }
  }

  @GrpcMethod('ContractService', 'GetContract')
  async getContractById(data: { tenantId: string; id: string }) {
    const contract = await this.getContractHandler.execute(
      new GetContractQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(ContractMapper.toResponse(contract)) }
  }

  @GrpcMethod('ContractService', 'ListContracts')
  async listContracts(data: {
    tenantId: string
    cursor?: string
    limit?: number
    status?: string
    companyId?: string
  }) {
    const result = await this.listContractsHandler.execute(
      new ListContractsQuery(data.tenantId, {
        status: data.status,
        companyId: data.companyId,
        cursor: data.cursor,
        limit: Math.min(data.limit || 20, 100),
      }),
    )
    return {
      jsonItems: result.data.map(c => JSON.stringify(ContractMapper.toResponse(c))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('ContractService', 'UpdateContract')
  async updateContract(data: {
    tenantId: string
    id: string
    name?: string
    startDate?: string
    endDate?: string
    autoRenew?: boolean
    mrrValue?: number
    status?: string
    ownerUserId?: string
  }) {
    await this.updateContractHandler.execute(
      new UpdateContractCommand(
        data.tenantId, data.id,
        data.name, data.startDate, data.endDate,
        data.autoRenew, data.mrrValue,
        data.status as ContractStatus, data.ownerUserId,
      ),
    )
    return {}
  }

  @GrpcMethod('ContractService', 'Renew')
  async renewContract(data: { tenantId: string; id: string }) {
    await this.renewContractHandler.execute(
      new RenewContractCommand(data.tenantId, data.id),
    )
    return {}
  }

  @GrpcMethod('ContractService', 'UpdateContractStatus')
  async updateContractStatus(data: { tenantId: string; id: string; status: string }) {
    await this.updateContractStatusHandler.execute(
      new UpdateContractStatusCommand(data.tenantId, data.id, data.status),
    )
    return {}
  }
}
