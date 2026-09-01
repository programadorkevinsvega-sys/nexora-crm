/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "../../api/api-client"
import type { CustomerSegmentRepository } from "@/src/domain/crm/loyalty/customer-segment.repository"
import type { CustomerSegment, SegmentCreateInput } from "@/src/domain/crm/loyalty/customer-segment.entity"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"

export interface CustomerMetrics {
  churnRiskScore: number | null
  rfmScore: number | string | null
  npsScore: number | null
  customerSatisfactionScore: number | null
}

export interface LoyaltyProfile {
  contactId: string
  balance?: number
  points?: number
  tier?: string
  tierLevel?: string
  loyaltyPointsBalance?: number
  totalLifetimeValue?: number
  totalPurchasesCount?: number
  averageOrderValue?: number
  churnRiskScore?: number | null
  rfmScore?: number | string | null
  npsScore?: number | null
  customerSatisfactionScore?: number | null
  history?: Array<{
    id: string
    points: number
    type: 'EARN' | 'REDEEM'
    reason: string
    createdAt: string
  }>
}

export class ApiLoyaltyRepository implements CustomerSegmentRepository {
  async list(): Promise<PaginatedResult<CustomerSegment>> {
    return ApiLoyaltyRepository.list()
  }

  async create(data: SegmentCreateInput): Promise<CustomerSegment> {
    return ApiLoyaltyRepository.create(data)
  }

  async assignToSegment(segmentId: string, contactId: string): Promise<void> {
    return ApiLoyaltyRepository.assignToSegment(segmentId, contactId)
  }

  static async list(): Promise<PaginatedResult<CustomerSegment>> {
    const res = await api.get<any>('/api/loyalty/segments')
    const items = Array.isArray(res) ? res : (res?.data || res?.items || [])
    return {
      items,
      total: items.length,
      data: items,
      nextCursor: null,
    } as any
  }

  static async listSegments(): Promise<CustomerSegment[]> {
    const res = await api.get<any>('/api/loyalty/segments')
    return Array.isArray(res) ? res : (res?.data || res?.items || [])
  }

  static async create(data: SegmentCreateInput): Promise<CustomerSegment> {
    return api.post<CustomerSegment>('/api/loyalty/segments', data)
  }

  static async assignToSegment(segmentId: string, contactId: string): Promise<void> {
    return api.post<void>(`/api/loyalty/segments/${segmentId}/assign`, { contactId })
  }

  static async getProfile(contactId: string): Promise<LoyaltyProfile | null> {
    const res = await api.get<any>(`/api/loyalty/profile/${contactId}`)
    if (!res) return null
    return {
      contactId,
      balance: res.pointsBalance || res.balance || 0,
      tierLevel: res.tier || res.tierLevel || 'BRONZE',
      tier: res.tier || 'BRONZE',
      loyaltyPointsBalance: res.pointsBalance || res.balance || 0,
      totalLifetimeValue: res.totalLifetimeValue || 0,
      totalPurchasesCount: res.totalPurchasesCount || 0,
      averageOrderValue: res.averageOrderValue || 0,
      churnRiskScore: res.churnRiskScore ?? 15,
      rfmScore: res.rfmScore ?? '4.2',
      npsScore: res.npsScore ?? 80,
      customerSatisfactionScore: res.customerSatisfactionScore ?? 4.5,
      history: res.history || [],
    }
  }

  static async getMetrics(contactId: string): Promise<CustomerMetrics> {
    const profile = await this.getProfile(contactId)
    return {
      churnRiskScore: profile?.churnRiskScore ?? 15,
      rfmScore: profile?.rfmScore ?? '4.2',
      npsScore: profile?.npsScore ?? 80,
      customerSatisfactionScore: profile?.customerSatisfactionScore ?? 4.5,
    }
  }

  static async earnPoints(contactId: string, points: number): Promise<any> {
    return api.post<any>('/api/loyalty/earn', { contactId, points })
  }

  static async redeemPoints(contactId: string, points: number): Promise<any> {
    return api.post<any>('/api/loyalty/redeem', { contactId, points })
  }
}
