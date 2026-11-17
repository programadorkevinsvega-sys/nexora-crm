import type { CustomerHealthScore } from '@crm/contracts'

export class ApiHealthScoreRepository {
  static async getContactHealthScore(contactId: string): Promise<CustomerHealthScore> {
    const res = await fetch(`/api/health-score/contact/${contactId}`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al obtener Customer Health Score')
    return res.json()
  }

  static async recalculateContactHealthScore(contactId: string): Promise<CustomerHealthScore> {
    const res = await fetch(`/api/health-score/contact/${contactId}/recalculate`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al recalcular Customer Health Score')
    return res.json()
  }

  static async listAtRiskCustomers(): Promise<CustomerHealthScore[]> {
    const res = await fetch('/api/health-score/at-risk', {
      credentials: 'include',
    })
    if (!res.ok) return []
    return res.json()
  }
}
