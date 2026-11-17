import { Controller, Get, Post, Body, Param, Query, Headers } from '@nestjs/common'
import {
  CreateScoringRuleHandler,
  ToggleRuleStatusHandler,
  RecalculateLeadScoreHandler,
  AdjustLeadScoreHandler,
} from '../../application/commands/lead-scoring.handlers'
import {
  GetLeadScoreHandler,
  ListScoringRulesHandler,
  ListTopLeadsHandler,
  ListLeadsByTemperatureHandler,
} from '../../application/queries/lead-scoring.handlers'
import {
  CreateScoringRuleCommand,
  ToggleRuleStatusCommand,
  RecalculateLeadScoreCommand,
  AdjustLeadScoreCommand,
} from '../../application/commands/lead-scoring.commands'
import {
  GetLeadScoreQuery,
  ListScoringRulesQuery,
  ListTopLeadsQuery,
  ListLeadsByTemperatureQuery,
} from '../../application/queries/lead-scoring.queries'
import { LeadScoringMapper } from '../../infrastructure/lead-scoring.mapper'
import { ScoringRuleCategory, ScoringCondition } from '@crm/contracts'

@Controller('scoring')
export class LeadScoringController {
  constructor(
    private readonly createRuleHandler: CreateScoringRuleHandler,
    private readonly toggleRuleHandler: ToggleRuleStatusHandler,
    private readonly recalculateHandler: RecalculateLeadScoreHandler,
    private readonly adjustScoreHandler: AdjustLeadScoreHandler,
    private readonly getLeadScoreHandler: GetLeadScoreHandler,
    private readonly listRulesHandler: ListScoringRulesHandler,
    private readonly listTopLeadsHandler: ListTopLeadsHandler,
    private readonly listByTempHandler: ListLeadsByTemperatureHandler,
  ) {}

  @Post('rules')
  async createRule(
    @Body() dto: { name: string; category: ScoringRuleCategory; condition: ScoringCondition; points: number; description?: string; decayDays?: number; decayPoints?: number },
    @Headers('X-Tenant-Id') tenantId: string,
  ) {
    const result = await this.createRuleHandler.execute(
      new CreateScoringRuleCommand(
        tenantId,
        dto.name,
        dto.category,
        dto.condition,
        dto.points,
        dto.description,
        dto.decayDays,
        dto.decayPoints,
      ),
    )
    return result
  }

  @Get('rules')
  async listRules(
    @Headers('X-Tenant-Id') tenantId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const rules = await this.listRulesHandler.execute(
      new ListScoringRulesQuery(tenantId, activeOnly === 'true'),
    )
    return rules.map(LeadScoringMapper.ruleToResponse)
  }

  @Post('rules/:id/toggle')
  async toggleRule(
    @Param('id') id: string,
    @Headers('X-Tenant-Id') tenantId: string,
  ) {
    const rule = await this.toggleRuleHandler.execute(
      new ToggleRuleStatusCommand(tenantId, id),
    )
    return LeadScoringMapper.ruleToResponse(rule)
  }

  @Get('leads/:contactId')
  async getLeadScore(
    @Param('contactId') contactId: string,
    @Headers('X-Tenant-Id') tenantId: string,
  ) {
    const score = await this.getLeadScoreHandler.execute(
      new GetLeadScoreQuery(tenantId, contactId),
    )
    return score ? LeadScoringMapper.scoreToResponse(score) : null
  }

  @Post('leads/:contactId/recalculate')
  async recalculate(
    @Param('contactId') contactId: string,
    @Body() body: { context: Record<string, unknown> },
    @Headers('X-Tenant-Id') tenantId: string,
  ) {
    const score = await this.recalculateHandler.execute(
      new RecalculateLeadScoreCommand(tenantId, contactId, body.context || {}),
    )
    return LeadScoringMapper.scoreToResponse(score)
  }

  @Post('leads/:contactId/adjust')
  async adjust(
    @Param('contactId') contactId: string,
    @Body() body: { points: number; reason: string; ruleId?: string },
    @Headers('X-Tenant-Id') tenantId: string,
  ) {
    const score = await this.adjustScoreHandler.execute(
      new AdjustLeadScoreCommand(tenantId, contactId, body.points, body.reason, body.ruleId),
    )
    return LeadScoringMapper.scoreToResponse(score)
  }

  @Get('top')
  async listTop(
    @Headers('X-Tenant-Id') tenantId: string,
    @Query('limit') limit?: string,
  ) {
    const scores = await this.listTopLeadsHandler.execute(
      new ListTopLeadsQuery(tenantId, limit ? parseInt(limit, 10) : 20),
    )
    return scores.map(LeadScoringMapper.scoreToResponse)
  }

  @Get('temperature/:temp')
  async listByTemperature(
    @Param('temp') temp: string,
    @Headers('X-Tenant-Id') tenantId: string,
  ) {
    const scores = await this.listByTempHandler.execute(
      new ListLeadsByTemperatureQuery(tenantId, temp.toUpperCase()),
    )
    return scores.map(LeadScoringMapper.scoreToResponse)
  }
}
