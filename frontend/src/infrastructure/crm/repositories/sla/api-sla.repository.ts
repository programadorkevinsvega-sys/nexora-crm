import { api } from '@/src/infrastructure/crm/api/api-client'
import type {
  SlaPolicy,
  CreateSlaPolicyDto,
  SlaEscalationRule,
  CreateSlaEscalationRuleDto,
  TicketSlaTracker,
} from '@crm/contracts'

export class ApiSlaRepository {
  static async listPolicies(): Promise<SlaPolicy[]> {
    return api.get<SlaPolicy[]>('/sla/policies')
  }

  static async createPolicy(dto: CreateSlaPolicyDto): Promise<SlaPolicy> {
    return api.post<SlaPolicy>('/sla/policies', dto)
  }

  static async listEscalationRules(policyId: string): Promise<SlaEscalationRule[]> {
    return api.get<SlaEscalationRule[]>(`/sla/policies/${policyId}/rules`)
  }

  static async createEscalationRule(dto: CreateSlaEscalationRuleDto): Promise<SlaEscalationRule> {
    return api.post<SlaEscalationRule>('/sla/rules', dto)
  }

  static async listTrackers(): Promise<TicketSlaTracker[]> {
    return api.get<TicketSlaTracker[]>('/sla/trackers')
  }
}
