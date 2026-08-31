import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateScoringRuleHandler,
  ToggleRuleStatusHandler,
  RecalculateLeadScoreHandler,
  AdjustLeadScoreHandler,
  ApplyScoreDecayHandler,
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
  ApplyScoreDecayCommand,
} from '../../application/commands/lead-scoring.commands'
import {
  GetLeadScoreQuery,
  ListScoringRulesQuery,
  ListTopLeadsQuery,
  ListLeadsByTemperatureQuery,
} from '../../application/queries/lead-scoring.queries'
import { LeadScoringMapper } from '../../infrastructure/lead-scoring.mapper'
import { ScoringRuleCategory, ScoringCondition } from '@crm/contracts'

@Controller()
export class LeadScoringGrpcController {
  constructor(
    private readonly createRuleHandler: CreateScoringRuleHandler,
    private readonly toggleRuleHandler: ToggleRuleStatusHandler,
    private readonly recalculateHandler: RecalculateLeadScoreHandler,
    private readonly adjustScoreHandler: AdjustLeadScoreHandler,
    private readonly applyDecayHandler: ApplyScoreDecayHandler,
    private readonly getLeadScoreHandler: GetLeadScoreHandler,
    private readonly listRulesHandler: ListScoringRulesHandler,
    private readonly listTopLeadsHandler: ListTopLeadsHandler,
    private readonly listByTempHandler: ListLeadsByTemperatureHandler,
  ) {}

  @GrpcMethod('LeadScoringService', 'CreateScoringRule')
  async createScoringRule(data: {
    tenantId: string
    name: string
    description?: string
    category: string
    conditionJson: string
    points: number
    decayDays?: number
    decayPoints?: number
  }) {
    const condition = JSON.parse(data.conditionJson) as ScoringCondition
    const result = await this.createRuleHandler.execute(
      new CreateScoringRuleCommand(
        data.tenantId,
        data.name,
        data.category as ScoringRuleCategory,
        condition,
        data.points,
        data.description,
        data.decayDays,
        data.decayPoints,
      ),
    )
    return { json: JSON.stringify({ id: result.id }) }
  }

  @GrpcMethod('LeadScoringService', 'ToggleRuleStatus')
  async toggleRuleStatus(data: { tenantId: string; id: string }) {
    const rule = await this.toggleRuleHandler.execute(
      new ToggleRuleStatusCommand(data.tenantId, data.id),
    )
    return { json: JSON.stringify(LeadScoringMapper.ruleToResponse(rule)) }
  }

  @GrpcMethod('LeadScoringService', 'ListScoringRules')
  async listScoringRules(data: { tenantId: string }) {
    const rules = await this.listRulesHandler.execute(
      new ListScoringRulesQuery(data.tenantId, false),
    )
    return {
      jsonItems: rules.map((r) => JSON.stringify(LeadScoringMapper.ruleToResponse(r))),
    }
  }

  @GrpcMethod('LeadScoringService', 'GetLeadScore')
  async getLeadScore(data: { tenantId: string; id: string }) {
    const score = await this.getLeadScoreHandler.execute(
      new GetLeadScoreQuery(data.tenantId, data.id),
    )
    return {
      json: score ? JSON.stringify(LeadScoringMapper.scoreToResponse(score)) : '{}',
    }
  }

  @GrpcMethod('LeadScoringService', 'RecalculateLeadScore')
  async recalculateLeadScore(data: {
    tenantId: string
    contactId: string
    contactContextJson: string
  }) {
    const context = JSON.parse(data.contactContextJson || '{}')
    const score = await this.recalculateHandler.execute(
      new RecalculateLeadScoreCommand(data.tenantId, data.contactId, context),
    )
    return { json: JSON.stringify(LeadScoringMapper.scoreToResponse(score)) }
  }

  @GrpcMethod('LeadScoringService', 'AdjustLeadScore')
  async adjustLeadScore(data: {
    tenantId: string
    contactId: string
    points: number
    reason: string
    ruleId?: string
  }) {
    const score = await this.adjustScoreHandler.execute(
      new AdjustLeadScoreCommand(
        data.tenantId,
        data.contactId,
        data.points,
        data.reason,
        data.ruleId,
      ),
    )
    return { json: JSON.stringify(LeadScoringMapper.scoreToResponse(score)) }
  }

  @GrpcMethod('LeadScoringService', 'ApplyScoreDecay')
  async applyScoreDecay(data: {
    tenantId: string
    contactId: string
    daysWithoutActivity: number
  }) {
    const score = await this.applyDecayHandler.execute(
      new ApplyScoreDecayCommand(data.tenantId, data.contactId, data.daysWithoutActivity),
    )
    return { json: JSON.stringify(LeadScoringMapper.scoreToResponse(score)) }
  }

  @GrpcMethod('LeadScoringService', 'ListTopLeads')
  async listTopLeads(data: { tenantId: string; limit?: number }) {
    const scores = await this.listTopLeadsHandler.execute(
      new ListTopLeadsQuery(data.tenantId, data.limit ?? 20),
    )
    return {
      jsonItems: scores.map((s) => JSON.stringify(LeadScoringMapper.scoreToResponse(s))),
    }
  }
}
