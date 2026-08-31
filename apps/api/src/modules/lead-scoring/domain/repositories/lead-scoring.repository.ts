import { LeadScoringRule } from '../entities/lead-scoring-rule.entity'
import { LeadScore } from '../entities/lead-score.entity'

export abstract class LeadScoringRuleRepository {
  abstract save(rule: LeadScoringRule): Promise<void>
  abstract findById(tenantId: string, id: string): Promise<LeadScoringRule | null>
  abstract listActive(tenantId: string): Promise<LeadScoringRule[]>
  abstract listAll(tenantId: string): Promise<LeadScoringRule[]>
  abstract delete(tenantId: string, id: string): Promise<void>
}

export abstract class LeadScoreRepository {
  abstract save(leadScore: LeadScore): Promise<void>
  abstract findByContactId(tenantId: string, contactId: string): Promise<LeadScore | null>
  abstract listTopLeads(tenantId: string, limit?: number): Promise<LeadScore[]>
  abstract listByTemperature(tenantId: string, temperature: string): Promise<LeadScore[]>
}
