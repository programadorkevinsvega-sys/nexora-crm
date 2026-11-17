import { Injectable } from '@nestjs/common'
import {
  GetLeadScoreQuery,
  ListScoringRulesQuery,
  ListTopLeadsQuery,
  ListLeadsByTemperatureQuery,
} from './lead-scoring.queries'
import {
  LeadScoringRuleRepository,
  LeadScoreRepository,
} from '../../domain/repositories/lead-scoring.repository'
import { LeadScore } from '../../domain/entities/lead-score.entity'
import { LeadScoringRule } from '../../domain/entities/lead-scoring-rule.entity'

@Injectable()
export class GetLeadScoreHandler {
  constructor(private readonly scoreRepo: LeadScoreRepository) {}

  async execute(query: GetLeadScoreQuery): Promise<LeadScore | null> {
    return this.scoreRepo.findByContactId(query.tenantId, query.contactId)
  }
}

@Injectable()
export class ListScoringRulesHandler {
  constructor(private readonly ruleRepo: LeadScoringRuleRepository) {}

  async execute(query: ListScoringRulesQuery): Promise<LeadScoringRule[]> {
    return query.activeOnly
      ? this.ruleRepo.listActive(query.tenantId)
      : this.ruleRepo.listAll(query.tenantId)
  }
}

@Injectable()
export class ListTopLeadsHandler {
  constructor(private readonly scoreRepo: LeadScoreRepository) {}

  async execute(query: ListTopLeadsQuery): Promise<LeadScore[]> {
    return this.scoreRepo.listTopLeads(query.tenantId, query.limit)
  }
}

@Injectable()
export class ListLeadsByTemperatureHandler {
  constructor(private readonly scoreRepo: LeadScoreRepository) {}

  async execute(query: ListLeadsByTemperatureQuery): Promise<LeadScore[]> {
    return this.scoreRepo.listByTemperature(query.tenantId, query.temperature)
  }
}
