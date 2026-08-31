import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  EarnPointsHandler,
  RedeemPointsHandler,
  CreateSegmentHandler,
  AssignToSegmentHandler,
} from '../../application/commands/loyalty.handlers'
import {
  GetProfileHandler,
  GetSegmentsHandler,
  GetMetricsHandler,
} from '../../application/queries/loyalty.handlers'
import {
  EarnPointsCommand,
  RedeemPointsCommand,
  CreateSegmentCommand,
  AssignToSegmentCommand,
} from '../../application/commands/loyalty.commands'
import {
  GetProfileQuery,
  GetSegmentsQuery,
  GetMetricsQuery,
} from '../../application/queries/loyalty.queries'
import { LoyaltyMapper, SegmentMapper, MetricsMapper } from '../../infrastructure/loyalty.mapper'

@Controller()
export class LoyaltyGrpcController {
  constructor(
    private readonly getProfileHandler: GetProfileHandler,
    private readonly earnPointsHandler: EarnPointsHandler,
    private readonly redeemPointsHandler: RedeemPointsHandler,
    private readonly listSegmentsHandler: GetSegmentsHandler,
    private readonly createSegmentHandler: CreateSegmentHandler,
    private readonly assignToSegmentHandler: AssignToSegmentHandler,
    private readonly getMetricsHandler: GetMetricsHandler,
  ) {}

  @GrpcMethod('LoyaltyService', 'GetProfile')
  async getProfile(data: { tenantId: string; contactId: string }) {
    const profile = await this.getProfileHandler.execute(
      new GetProfileQuery(data.tenantId, data.contactId),
    )
    return { json: JSON.stringify(LoyaltyMapper.toResponse(profile)) }
  }

  @GrpcMethod('LoyaltyService', 'EarnPoints')
  async earnPoints(data: { tenantId: string; contactId: string; points: number }) {
    const result = await this.earnPointsHandler.execute(
      new EarnPointsCommand(data.tenantId, data.contactId, data.points),
    )
    return { id: result.id, newBalance: result.newBalance }
  }

  @GrpcMethod('LoyaltyService', 'RedeemPoints')
  async redeemPoints(data: { tenantId: string; contactId: string; points: number }) {
    const result = await this.redeemPointsHandler.execute(
      new RedeemPointsCommand(data.tenantId, data.contactId, data.points),
    )
    return { id: result.id, newBalance: result.newBalance }
  }

  @GrpcMethod('LoyaltyService', 'ListSegments')
  async listSegments(data: { tenantId: string }) {
    const segments = await this.listSegmentsHandler.execute(
      new GetSegmentsQuery(data.tenantId),
    )
    return {
      jsonItems: segments.map(s => JSON.stringify(SegmentMapper.toResponse(s))),
    }
  }

  @GrpcMethod('LoyaltyService', 'CreateSegment')
  async createSegment(data: {
    tenantId: string
    name: string
    description?: string
    isDynamic?: boolean
    rulesJson?: string
  }) {
    let parsedRules: Record<string, unknown> | undefined
    if (data.rulesJson) {
      try {
        parsedRules = (typeof data.rulesJson === 'string' ? JSON.parse(data.rulesJson) : data.rulesJson) as Record<string, unknown>
      } catch {
        parsedRules = undefined
      }
    }
    const result = await this.createSegmentHandler.execute(
      new CreateSegmentCommand(
        data.tenantId, data.name, data.description, data.isDynamic,
        parsedRules,
      ),
    )
    return {
      id: result.id,
      json: JSON.stringify({
        id: result.id,
        tenantId: data.tenantId,
        name: data.name,
        description: data.description ?? null,
        isDynamic: data.isDynamic ?? false,
      }),
    }
  }

  @GrpcMethod('LoyaltyService', 'AssignToSegment')
  async assignToSegment(data: { tenantId: string; segmentId: string; contactId: string }) {
    await this.assignToSegmentHandler.execute(
      new AssignToSegmentCommand(data.tenantId, data.segmentId, data.contactId),
    )
    return {}
  }

  @GrpcMethod('LoyaltyService', 'GetMetrics')
  async getMetrics(data: { tenantId: string; contactId: string }) {
    const metrics = await this.getMetricsHandler.execute(
      new GetMetricsQuery(data.tenantId, data.contactId),
    )
    return { json: JSON.stringify(MetricsMapper.toResponse(metrics)) }
  }
}
