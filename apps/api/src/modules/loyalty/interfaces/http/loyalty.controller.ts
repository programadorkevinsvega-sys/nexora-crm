import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { EarnPointsHandler, RedeemPointsHandler, CreateSegmentHandler, AssignToSegmentHandler } from '../../application/commands/loyalty.handlers'
import { GetProfileHandler, GetSegmentsHandler, GetMetricsHandler } from '../../application/queries/loyalty.handlers'
import { EarnPointsCommand, RedeemPointsCommand, CreateSegmentCommand, AssignToSegmentCommand } from '../../application/commands/loyalty.commands'
import { GetProfileQuery, GetSegmentsQuery, GetMetricsQuery } from '../../application/queries/loyalty.queries'
import { EarnPointsDto, RedeemPointsDto, CreateSegmentDto, AssignToSegmentDto } from './dto/loyalty.dto'
import { TenantId } from '../../../../common/decorators/tenant-id.decorator'
import { LoyaltyMapper, SegmentMapper, MetricsMapper } from '../../infrastructure/loyalty.mapper'

@Controller('loyalty')
export class LoyaltyController {
  constructor(
    private readonly earnPointsHandler: EarnPointsHandler,
    private readonly redeemPointsHandler: RedeemPointsHandler,
    private readonly createSegmentHandler: CreateSegmentHandler,
    private readonly assignToSegmentHandler: AssignToSegmentHandler,
    private readonly getProfileHandler: GetProfileHandler,
    private readonly getSegmentsHandler: GetSegmentsHandler,
    private readonly getMetricsHandler: GetMetricsHandler,
  ) {}

  @Get('profiles/:contactId')
  async getProfile(@Param('contactId') contactId: string, @TenantId() tenantId: string) {
    const profile = await this.getProfileHandler.execute(new GetProfileQuery(tenantId, contactId))
    return LoyaltyMapper.toResponse(profile)
  }

  @Post('profiles/:contactId/earn')
  async earnPoints(@Param('contactId') contactId: string, @Body() dto: EarnPointsDto, @TenantId() tenantId: string) {
    return this.earnPointsHandler.execute(new EarnPointsCommand(tenantId, contactId, dto.points))
  }

  @Post('profiles/:contactId/redeem')
  async redeemPoints(@Param('contactId') contactId: string, @Body() dto: RedeemPointsDto, @TenantId() tenantId: string) {
    return this.redeemPointsHandler.execute(new RedeemPointsCommand(tenantId, contactId, dto.points))
  }

  @Get('segments')
  async listSegments(@TenantId() tenantId: string) {
    const segments = await this.getSegmentsHandler.execute(new GetSegmentsQuery(tenantId))
    return segments.map(SegmentMapper.toResponse)
  }

  @Post('segments')
  async createSegment(@Body() dto: CreateSegmentDto, @TenantId() tenantId: string) {
    return this.createSegmentHandler.execute(
      new CreateSegmentCommand(tenantId, dto.name, dto.description, dto.isDynamic, dto.rulesJson),
    )
  }

  @Post('segments/:id/assign')
  async assignToSegment(@Param('id') id: string, @Body() dto: AssignToSegmentDto, @TenantId() tenantId: string) {
    await this.assignToSegmentHandler.execute(new AssignToSegmentCommand(tenantId, id, dto.contactId))
    return { id, contactId: dto.contactId }
  }

  @Get('metrics/:contactId')
  async getMetrics(@Param('contactId') contactId: string, @TenantId() tenantId: string) {
    const metrics = await this.getMetricsHandler.execute(new GetMetricsQuery(tenantId, contactId))
    return MetricsMapper.toResponse(metrics)
  }
}
