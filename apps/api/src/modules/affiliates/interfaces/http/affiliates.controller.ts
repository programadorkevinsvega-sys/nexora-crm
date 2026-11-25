import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common'
import { CreateProgramHandler, UpdateProgramHandler, RegisterAffiliateHandler, RecordCommissionHandler, ProcessPayoutHandler } from '../../application/commands/affiliate.handlers'
import { GetProgramHandler, ListProgramsHandler, GetAffiliateHandler, ListAffiliatesHandler, GetCommissionsHandler, GetPayoutsHandler } from '../../application/queries/affiliate.handlers'
import { CreateProgramCommand, UpdateProgramCommand, RegisterAffiliateCommand, RecordCommissionCommand, ProcessPayoutCommand } from '../../application/commands/affiliate.commands'
import { ListProgramsQuery, GetAffiliateQuery, ListAffiliatesQuery, GetCommissionsQuery, GetPayoutsQuery } from '../../application/queries/affiliate.queries'
import { CreateProgramDto, UpdateProgramDto, RegisterAffiliateDto, RecordCommissionDto, ProcessPayoutDto } from './dto/affiliate.dto'
import { TenantId } from '../../../../common/decorators/tenant-id.decorator'
import { AffiliateMapper } from '../../infrastructure/affiliate.mapper'

@Controller('affiliates')
export class AffiliatesController {
  constructor(
    private readonly createProgramHandler: CreateProgramHandler,
    private readonly updateProgramHandler: UpdateProgramHandler,
    private readonly registerAffiliateHandler: RegisterAffiliateHandler,
    private readonly recordCommissionHandler: RecordCommissionHandler,
    private readonly processPayoutHandler: ProcessPayoutHandler,
    private readonly getProgramHandler: GetProgramHandler,
    private readonly listProgramsHandler: ListProgramsHandler,
    private readonly getAffiliateHandler: GetAffiliateHandler,
    private readonly listAffiliatesHandler: ListAffiliatesHandler,
    private readonly getCommissionsHandler: GetCommissionsHandler,
    private readonly getPayoutsHandler: GetPayoutsHandler,
  ) {}

  @Get('programs')
  async listPrograms(
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('search') search: string | undefined,
    @Query('isActive') isActive: string | undefined,
    @TenantId() tenantId: string,
  ) {
    const result = await this.listProgramsHandler.execute(
      new ListProgramsQuery(tenantId, {
        search,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        cursor,
        limit: Math.min(Number(limit) || 20, 100),
      }),
    )
    return {
      data: result.data.map(AffiliateMapper.programToResponse),
      nextCursor: result.nextCursor,
    }
  }

  @Post('programs')
  async createProgram(@Body() dto: CreateProgramDto, @TenantId() tenantId: string) {
    const result = await this.createProgramHandler.execute(
      new CreateProgramCommand(tenantId, dto.name, dto.commissionType, dto.commissionValue, dto.cookieDurationDays, dto.isMultiLevel, dto.maxMlmLevels, dto.isActive),
    )
    return result
  }

  @Put('programs/:id')
  async updateProgram(@Param('id') id: string, @Body() dto: UpdateProgramDto, @TenantId() tenantId: string) {
    await this.updateProgramHandler.execute(
      new UpdateProgramCommand(tenantId, id, dto.name, dto.commissionType, dto.commissionValue, dto.cookieDurationDays, dto.isMultiLevel, dto.maxMlmLevels, dto.isActive),
    )
    return { id }
  }

  @Get()
  async list(
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('programId') programId: string | undefined,
    @Query('status') status: string | undefined,
    @TenantId() tenantId: string,
  ) {
    const result = await this.listAffiliatesHandler.execute(
      new ListAffiliatesQuery(tenantId, {
        programId,
        status,
        cursor,
        limit: Math.min(Number(limit) || 20, 100),
      }),
    )
    return {
      data: result.data.map(AffiliateMapper.affiliateToResponse),
      nextCursor: result.nextCursor,
    }
  }

  @Post()
  async register(@Body() dto: RegisterAffiliateDto, @TenantId() tenantId: string) {
    const result = await this.registerAffiliateHandler.execute(
      new RegisterAffiliateCommand(tenantId, dto.programId, dto.customerId, dto.referralCode, dto.referralLink, dto.parentAffiliateId, dto.mlmLevel, dto.status),
    )
    return result
  }

  @Get(':id')
  async get(@Param('id') id: string, @TenantId() tenantId: string) {
    const affiliate = await this.getAffiliateHandler.execute(new GetAffiliateQuery(tenantId, id))

    const commissionsResult = await this.getCommissionsHandler.execute(
      new GetCommissionsQuery(tenantId, { affiliateId: id, limit: 100 }),
    )
    const payoutsResult = await this.getPayoutsHandler.execute(
      new GetPayoutsQuery(tenantId, { affiliateId: id, limit: 100 }),
    )

    return {
      ...AffiliateMapper.affiliateToResponse(affiliate),
      commissions: commissionsResult.data.map(AffiliateMapper.commissionToResponse),
      payouts: payoutsResult.data.map(AffiliateMapper.payoutToResponse),
    }
  }

  @Post(':id/commissions')
  async recordCommission(@Param('id') id: string, @Body() dto: RecordCommissionDto, @TenantId() tenantId: string) {
    const result = await this.recordCommissionHandler.execute(
      new RecordCommissionCommand(tenantId, id, dto.sourceOrderId, dto.commissionAmount, dto.mlmLevelEarned, dto.status),
    )
    return result
  }

  @Get(':id/commissions')
  async listCommissions(
    @Param('id') id: string,
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('status') status: string | undefined,
    @TenantId() tenantId: string,
  ) {
    const result = await this.getCommissionsHandler.execute(
      new GetCommissionsQuery(tenantId, {
        affiliateId: id,
        status,
        cursor,
        limit: Math.min(Number(limit) || 20, 100),
      }),
    )
    return {
      data: result.data.map(AffiliateMapper.commissionToResponse),
      nextCursor: result.nextCursor,
    }
  }

  @Post(':id/payouts')
  async processPayout(@Param('id') id: string, @Body() dto: ProcessPayoutDto, @TenantId() tenantId: string) {
    const result = await this.processPayoutHandler.execute(
      new ProcessPayoutCommand(tenantId, id, dto.amount, dto.paymentMethod, dto.paymentReference, dto.status),
    )
    return result
  }

  @Get(':id/payouts')
  async listPayouts(
    @Param('id') id: string,
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('status') status: string | undefined,
    @TenantId() tenantId: string,
  ) {
    const result = await this.getPayoutsHandler.execute(
      new GetPayoutsQuery(tenantId, {
        affiliateId: id,
        status,
        cursor,
        limit: Math.min(Number(limit) || 20, 100),
      }),
    )
    return {
      data: result.data.map(AffiliateMapper.payoutToResponse),
      nextCursor: result.nextCursor,
    }
  }
}
