import { api } from "../../api/api-client"

export interface CustomerSegment {
  id: string
  name: string
  description?: string
  minPoints?: number
  maxPoints?: number
  memberCount?: number
}

export interface LoyaltyProfile {
  contactId: string
  balance: number
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  history?: Array<{
    id: string
    points: number
    type: 'EARN' | 'REDEEM'
    reason: string
    createdAt: string
  }>
}

export class ApiLoyaltyRepository {
  static async listSegments(): Promise<CustomerSegment[]> {
    const res = await api.get<any>('/api/loyalty/segments')
    return Array.isArray(res) ? res : []
  }

  static async getProfile(contactId: string): Promise<LoyaltyProfile | null> {
    return api.get<LoyaltyProfile | null>(`/api/loyalty/profile/${contactId}`)
  }

  static async earnPoints(contactId: string, points: number): Promise<any> {
    return api.post<any>('/api/loyalty/earn', { contactId, points })
  }

  static async redeemPoints(contactId: string, points: number): Promise<any> {
    return api.post<any>('/api/loyalty/redeem', { contactId, points })
  }
}
