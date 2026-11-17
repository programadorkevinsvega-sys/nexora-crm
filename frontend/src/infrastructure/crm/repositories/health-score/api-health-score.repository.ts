import type { CustomerHealthScore } from '@crm/contracts'
import { api } from '../../api/api-client'

export class ApiHealthScoreRepository {
  static async getContactHealthScore(contactId: string): Promise<CustomerHealthScore> {
    return api.get<CustomerHealthScore>(`/api/health-score/contact/${contactId}`)
  }

  static async recalculateContactHealthScore(contactId: string): Promise<CustomerHealthScore> {
    return api.post<CustomerHealthScore>(`/api/health-score/contact/${contactId}/recalculate`)
  }

  static async listAtRiskCustomers(): Promise<CustomerHealthScore[]> {
    return api.get<CustomerHealthScore[]>('/api/health-score/at-risk')
  }
}
