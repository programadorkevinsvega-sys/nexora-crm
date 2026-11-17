import type {
  CommissionPlan,
  CreateCommissionPlanDto,
  CommissionRecord,
  CalculateCommissionDto,
} from '@crm/contracts'
import { api } from '../../api/api-client'

export class ApiCommissionsRepository {
  static async listPlans(): Promise<CommissionPlan[]> {
    return api.get<CommissionPlan[]>('/api/commissions/plans')
  }

  static async createPlan(dto: CreateCommissionPlanDto): Promise<CommissionPlan> {
    return api.post<CommissionPlan>('/api/commissions/plans', dto)
  }

  static async listRecords(userId?: string, period?: string): Promise<CommissionRecord[]> {
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId)
    if (period) params.append('period', period)

    return api.get<CommissionRecord[]>(`/api/commissions/records?${params.toString()}`)
  }

  static async calculateCommission(dto: CalculateCommissionDto): Promise<CommissionRecord> {
    return api.post<CommissionRecord>('/api/commissions/calculate', dto)
  }

  static async approveRecord(recordId: string): Promise<CommissionRecord> {
    return api.patch<CommissionRecord>(`/api/commissions/records/${recordId}/approve`)
  }

  static async markAsPaid(recordId: string): Promise<CommissionRecord> {
    return api.patch<CommissionRecord>(`/api/commissions/records/${recordId}/pay`)
  }
}
