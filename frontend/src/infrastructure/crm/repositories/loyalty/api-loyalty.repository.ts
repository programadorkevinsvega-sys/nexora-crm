import { api } from "../../api/api-client"
import type { CustomerSegmentRepository } from "@/src/domain/crm/loyalty/customer-segment.repository"
import type { CustomerSegment, SegmentCreateInput } from "@/src/domain/crm/loyalty/customer-segment.entity"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"

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
    return api.get<LoyaltyProfile | null>(`/api/loyalty/profile/${contactId}`)
  }

  static async earnPoints(contactId: string, points: number): Promise<any> {
    return api.post<any>('/api/loyalty/earn', { contactId, points })
  }

  static async redeemPoints(contactId: string, points: number): Promise<any> {
    return api.post<any>('/api/loyalty/redeem', { contactId, points })
  }
}
