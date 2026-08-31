import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { LeadScoringBffService } from './lead-scoring.bff.service'
import { CreateScoringRuleSchema, AdjustScoreSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import type { CreateScoringRule, AdjustScore, LeadScoringRule, LeadScore } from '@crm/contracts'

@Controller('api/scoring')
export class LeadScoringBffController {
  constructor(private readonly service: LeadScoringBffService) {}

  @Post('rules')
  async createRule(
    @Body(createZodPipe(CreateScoringRuleSchema)) dto: CreateScoringRule,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ id: string }> {
    return this.service.createRule(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('rules')
  async listRules(
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<LeadScoringRule[]> {
    return this.service.listRules(tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('rules/:id/toggle')
  async toggleRule(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<LeadScoringRule> {
    return this.service.toggleRule(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('leads/:contactId')
  async getLeadScore(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<LeadScore | null> {
    return this.service.getLeadScore(contactId, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('leads/:contactId/recalculate')
  async recalculate(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Body() body: { context: Record<string, unknown> },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<LeadScore> {
    return this.service.recalculateScore(contactId, body?.context || {}, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('leads/:contactId/adjust')
  async adjust(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Body(createZodPipe(AdjustScoreSchema)) dto: AdjustScore,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<LeadScore> {
    return this.service.adjustScore({ ...dto, contactId }, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('top')
  async listTop(
    @Query('limit') limit?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<LeadScore[]> {
    const lim = limit ? parseInt(limit, 10) : 20
    return this.service.listTopLeads(lim, tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
