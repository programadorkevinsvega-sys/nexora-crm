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

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function dateOrThrow(value: unknown, fieldName: string): Date {
  const date = typeof value === 'string' || value instanceof Date ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) throw new TypeError(`Invalid segment ${fieldName}`)
  return date
}

function toCustomerSegment(value: unknown): CustomerSegment {
  if (!isRecord(value)) throw new TypeError('Segment response must be an object')
  const id = stringOrNull(value.id)
  const tenantId = stringOrNull(value.tenantId)
  const name = stringOrNull(value.name)
  if (!id || !tenantId || !name) throw new TypeError('Segment response is missing its identity fields')
  return CustomerSegment.create({
    tenantId,
    name,
    description: stringOrNull(value.description),
    isDynamic: value.isDynamic === true,
    rulesJson: value.rulesJson,
  }, id, dateOrThrow(value.createdAt, 'createdAt'), dateOrThrow(value.updatedAt, 'updatedAt'))
}

function toSegmentList(response: unknown): CustomerSegment[] {
  if (Array.isArray(response)) return response.map(toCustomerSegment)
  if (!isRecord(response)) throw new TypeError('Segment list response must be an array or object')
  const items = Array.isArray(response.data) ? response.data : response.items
  if (!Array.isArray(items)) throw new TypeError('Segment list response is missing data')
  return items.map(toCustomerSegment)
}

function toHistory(value: unknown): LoyaltyProfile['history'] {
  if (!Array.isArray(value)) return undefined
  return value.flatMap((entry): NonNullable<LoyaltyProfile['history']> => {
    if (!isRecord(entry)) return []
    const id = stringOrNull(entry.id)
    const points = numberOrNull(entry.points)
    const type = entry.type
    const reason = stringOrNull(entry.reason)
    const createdAt = stringOrNull(entry.createdAt)
    if (!id || points === null || (type !== 'EARN' && type !== 'REDEEM') || !reason || !createdAt) return []
    return [{ id, points, type, reason, createdAt }]
  })
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
    const response = await api.get<unknown>('/api/loyalty/segments')
    return { data: toSegmentList(response), nextCursor: null }
  }

  static async listSegments(): Promise<CustomerSegment[]> {
    return (await this.list()).data
  }

  static async create(data: SegmentCreateInput): Promise<CustomerSegment> {
    const response = await api.post<unknown>('/api/loyalty/segments', data)
    return toCustomerSegment(response)
  }

  static async assignToSegment(segmentId: string, contactId: string): Promise<void> {
    await api.post<unknown>(`/api/loyalty/segments/${segmentId}/assign`, { contactId })
  }

  static async getProfile(contactId: string): Promise<LoyaltyProfile | null> {
    const response: unknown = await api.get<unknown>(`/api/loyalty/profile/${contactId}`)
    if (!isRecord(response)) return null
    const balance = numberOrNull(response.pointsBalance) ?? numberOrNull(response.balance)
    const tier = stringOrNull(response.tier) ?? stringOrNull(response.tierLevel) ?? undefined
    return {
      contactId,
      ...(balance !== null ? { balance, points: balance, loyaltyPointsBalance: balance } : {}),
      ...(tier ? { tier, tierLevel: tier } : {}),
      totalLifetimeValue: numberOrNull(response.totalLifetimeValue) ?? undefined,
      totalPurchasesCount: numberOrNull(response.totalPurchasesCount) ?? undefined,
      averageOrderValue: numberOrNull(response.averageOrderValue) ?? undefined,
      churnRiskScore: numberOrNull(response.churnRiskScore),
      rfmScore: numberOrNull(response.rfmScore) ?? stringOrNull(response.rfmScore),
      npsScore: numberOrNull(response.npsScore),
      customerSatisfactionScore: numberOrNull(response.customerSatisfactionScore),
      history: toHistory(response.history),
    }
  }

  static async getMetrics(contactId: string): Promise<CustomerMetrics> {
    const profile = await this.getProfile(contactId)
    return {
      churnRiskScore: profile?.churnRiskScore ?? null,
      rfmScore: profile?.rfmScore ?? null,
      npsScore: profile?.npsScore ?? null,
      customerSatisfactionScore: profile?.customerSatisfactionScore ?? null,
    }
  }

  static async earnPoints(contactId: string, points: number): Promise<unknown> {
    return api.post<unknown>('/api/loyalty/earn', { contactId, points })
  }

  static async redeemPoints(contactId: string, points: number): Promise<unknown> {
    return api.post<unknown>('/api/loyalty/redeem', { contactId, points })
  }
}
