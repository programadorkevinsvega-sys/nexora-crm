import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  RecordCommissionHandler,
  ProcessPayoutHandler,
} from '../../application/commands/affiliate.handlers'
import {
  GetCommissionsHandler,
  GetPayoutsHandler,
} from '../../application/queries/affiliate.handlers'
import {
  RecordCommissionCommand,
  ProcessPayoutCommand,
} from '../../application/commands/affiliate.commands'
import {
  GetCommissionsQuery,
  GetPayoutsQuery,
} from '../../application/queries/affiliate.queries'
import { AffiliateMapper } from '../../infrastructure/affiliate.mapper'

@Controller()
export class AffiliatesCommissionsPayoutsGrpcController {
  constructor(
    private readonly recordCommissionHandler: RecordCommissionHandler,
    private readonly listCommissionsHandler: GetCommissionsHandler,
    private readonly processPayoutHandler: ProcessPayoutHandler,
    private readonly listPayoutsHandler: GetPayoutsHandler,
  ) {}

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
      jsonItems: result.data.map((c) => JSON.stringify(AffiliateMapper.commissionToResponse(c))),
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
      jsonItems: result.data.map((p) => JSON.stringify(AffiliateMapper.payoutToResponse(p))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }
}
