import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateProgramHandler,
  UpdateProgramHandler,
  RegisterAffiliateHandler,
  RecordCommissionHandler,
  ProcessPayoutHandler,
} from '../../application/commands/affiliate.handlers'
import {
  GetProgramHandler,
  ListProgramsHandler,
  GetAffiliateHandler,
  ListAffiliatesHandler,
  GetCommissionsHandler,
  GetPayoutsHandler,
} from '../../application/queries/affiliate.handlers'
import {
  CreateProgramCommand,
  UpdateProgramCommand,
  RegisterAffiliateCommand,
  RecordCommissionCommand,
  ProcessPayoutCommand,
} from '../../application/commands/affiliate.commands'
import {
  GetProgramQuery,
  ListProgramsQuery,
  GetAffiliateQuery,
  ListAffiliatesQuery,
  GetCommissionsQuery,
  GetPayoutsQuery,
} from '../../application/queries/affiliate.queries'
import { AffiliateMapper } from '../../infrastructure/affiliate.mapper'

@Controller()
export class AffiliatesGrpcController {
  constructor(
    private readonly createProgramHandler: CreateProgramHandler,
    private readonly getProgramHandler: GetProgramHandler,
    private readonly listProgramsHandler: ListProgramsHandler,
    private readonly updateProgramHandler: UpdateProgramHandler,
    private readonly registerAffiliateHandler: RegisterAffiliateHandler,
    private readonly getAffiliateHandler: GetAffiliateHandler,
    private readonly listAffiliatesHandler: ListAffiliatesHandler,
    private readonly recordCommissionHandler: RecordCommissionHandler,
    private readonly listCommissionsHandler: GetCommissionsHandler,
    private readonly processPayoutHandler: ProcessPayoutHandler,
    private readonly listPayoutsHandler: GetPayoutsHandler,
  ) {}

  @GrpcMethod('AffiliateService', 'CreateProgram')
  async createProgram(data: {
    tenantId: string
    name: string
    commissionType: string
    commissionValue: number
    cookieDurationDays?: number
    isMultiLevel?: boolean
    maxMlmLevels?: number
    isActive?: boolean
  }) {
    const result = await this.createProgramHandler.execute(
      new CreateProgramCommand(
        data.tenantId, data.name, data.commissionType, data.commissionValue,
        data.cookieDurationDays, data.isMultiLevel, data.maxMlmLevels, data.isActive,
      ),
    )
    const program = await this.getProgramHandler.execute(
      new GetProgramQuery(data.tenantId, result.id),
    )
    return { json: JSON.stringify(AffiliateMapper.programToResponse(program)) }
  }

  @GrpcMethod('AffiliateService', 'GetProgram')
  async getProgram(data: { tenantId: string; id: string }) {
    const program = await this.getProgramHandler.execute(
      new GetProgramQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(AffiliateMapper.programToResponse(program)) }
  }

  @GrpcMethod('AffiliateService', 'ListPrograms')
  async listPrograms(data: {
    tenantId: string
    search?: string
    isActive?: boolean
    cursor?: string
    limit?: number
  }) {
    const result = await this.listProgramsHandler.execute(
      new ListProgramsQuery(data.tenantId, {
        search: data.search,
        isActive: data.isActive,
        cursor: data.cursor,
        limit: Math.min(data.limit || 20, 100),
      }),
    )
    return {
      jsonItems: result.data.map(p => JSON.stringify(AffiliateMapper.programToResponse(p))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('AffiliateService', 'UpdateProgram')
  async updateProgram(data: {
    tenantId: string
    id: string
    name?: string
    commissionType?: string
    commissionValue?: number
    cookieDurationDays?: number
    isMultiLevel?: boolean
    maxMlmLevels?: number
    isActive?: boolean
  }) {
    await this.updateProgramHandler.execute(
      new UpdateProgramCommand(
        data.tenantId, data.id, data.name, data.commissionType,
        data.commissionValue, data.cookieDurationDays, data.isMultiLevel,
        data.maxMlmLevels, data.isActive,
      ),
    )
    return {}
  }

  @GrpcMethod('AffiliateService', 'RegisterAffiliate')
  async registerAffiliate(data: {
    tenantId: string
    programId: string
    customerId: string
    referralCode: string
    referralLink: string
    parentAffiliateId?: string
    mlmLevel?: number
    status?: string
  }) {
    const result = await this.registerAffiliateHandler.execute(
      new RegisterAffiliateCommand(
        data.tenantId, data.programId, data.customerId, data.referralCode,
        data.referralLink, data.parentAffiliateId, data.mlmLevel, data.status,
      ),
    )
    const affiliate = await this.getAffiliateHandler.execute(
      new GetAffiliateQuery(data.tenantId, result.id),
    )
    return { json: JSON.stringify(AffiliateMapper.affiliateToResponse(affiliate)) }
  }

  @GrpcMethod('AffiliateService', 'GetAffiliate')
  async getAffiliate(data: { tenantId: string; id: string }) {
    const affiliate = await this.getAffiliateHandler.execute(
      new GetAffiliateQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(AffiliateMapper.affiliateToResponse(affiliate)) }
  }

  @GrpcMethod('AffiliateService', 'ListAffiliates')
  async listAffiliates(data: {
    tenantId: string
    programId?: string
    status?: string
    search?: string
    cursor?: string
    limit?: number
  }) {
    const result = await this.listAffiliatesHandler.execute(
      new ListAffiliatesQuery(data.tenantId, {
        programId: data.programId,
        status: data.status,
        search: data.search,
        cursor: data.cursor,
        limit: Math.min(data.limit || 20, 100),
      }),
    )
    return {
      jsonItems: result.data.map(a => JSON.stringify(AffiliateMapper.affiliateToResponse(a))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('AffiliateService', 'RecordCommission')
  async recordCommission(data: {
    tenantId: string
    affiliateId: string
    sourceOrderId: string
    commissionAmount: number
    mlmLevelEarned?: number
    status?: string
    approvedAt?: string
  }) {
    const result = await this.recordCommissionHandler.execute(
      new RecordCommissionCommand(
        data.tenantId, data.affiliateId, data.sourceOrderId, data.commissionAmount,
        data.mlmLevelEarned, data.status,
        data.approvedAt ? new Date(data.approvedAt) : undefined,
      ),
    )
    return { id: result.id }
  }

  @GrpcMethod('AffiliateService', 'ListCommissions')
  async listCommissions(data: {
    tenantId: string
    affiliateId?: string
    status?: string
    cursor?: string
    limit?: number
  }) {
    const result = await this.listCommissionsHandler.execute(
      new GetCommissionsQuery(data.tenantId, {
        affiliateId: data.affiliateId,
        status: data.status,
        cursor: data.cursor,
        limit: Math.min(data.limit || 20, 100),
      }),
    )
    return {
      jsonItems: result.data.map(c => JSON.stringify(AffiliateMapper.commissionToResponse(c))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('AffiliateService', 'ProcessPayout')
  async processPayout(data: {
    tenantId: string
    affiliateId: string
    amount: number
    paymentMethod?: string
    paymentReference?: string
    status?: string
    paidAt?: string
  }) {
    const result = await this.processPayoutHandler.execute(
      new ProcessPayoutCommand(
        data.tenantId, data.affiliateId, data.amount, data.paymentMethod,
        data.paymentReference, data.status,
        data.paidAt ? new Date(data.paidAt) : undefined,
      ),
    )
    return { id: result.id }
  }

  @GrpcMethod('AffiliateService', 'ListPayouts')
  async listPayouts(data: {
    tenantId: string
    affiliateId?: string
    status?: string
    cursor?: string
    limit?: number
  }) {
    const result = await this.listPayoutsHandler.execute(
      new GetPayoutsQuery(data.tenantId, {
        affiliateId: data.affiliateId,
        status: data.status,
        cursor: data.cursor,
        limit: Math.min(data.limit || 20, 100),
      }),
    )
    return {
      jsonItems: result.data.map(p => JSON.stringify(AffiliateMapper.payoutToResponse(p))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }
}
