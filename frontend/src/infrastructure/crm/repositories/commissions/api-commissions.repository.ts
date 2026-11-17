import type {
  CommissionPlan,
  CreateCommissionPlanDto,
  CommissionRecord,
  CalculateCommissionDto,
} from '@crm/contracts'

export class ApiCommissionsRepository {
  static async listPlans(): Promise<CommissionPlan[]> {
    const res = await fetch('/api/commissions/plans', { credentials: 'include' })
    if (!res.ok) throw new Error('Error al listar planes de comisiones')
    return res.json()
  }

  static async createPlan(dto: CreateCommissionPlanDto): Promise<CommissionPlan> {
    const res = await fetch('/api/commissions/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error('Error al crear plan de comisiones')
    return res.json()
  }

  static async listRecords(userId?: string, period?: string): Promise<CommissionRecord[]> {
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId)
    if (period) params.append('period', period)

    const res = await fetch(`/api/commissions/records?${params.toString()}`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al listar asientos de comisiones')
    return res.json()
  }

  static async calculateCommission(dto: CalculateCommissionDto): Promise<CommissionRecord> {
    const res = await fetch('/api/commissions/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error('Error al calcular comisión')
    return res.json()
  }

  static async approveRecord(recordId: string): Promise<CommissionRecord> {
    const res = await fetch(`/api/commissions/records/${recordId}/approve`, {
      method: 'PATCH',
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al aprobar comisión')
    return res.json()
  }

  static async markAsPaid(recordId: string): Promise<CommissionRecord> {
    const res = await fetch(`/api/commissions/records/${recordId}/pay`, {
      method: 'PATCH',
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al liquidar comisión')
    return res.json()
  }
}
