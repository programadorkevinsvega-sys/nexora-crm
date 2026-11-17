import { LoyaltyProfile } from '../domain/entities/loyalty-profile.entity'
import { CustomerSegment } from '../domain/entities/customer-segment.entity'
import { CustomerMetrics } from '../domain/entities/customer-metrics.entity'

type LoyaltyProfileRow = {
  id: string
  tenantId: string
  contactId: string
  loyaltyPointsBalance: number | null
  tierLevel: string | null
  totalLifetimeValue: string | null
  totalPurchasesCount: number | null
  averageOrderValue: string | null
  lastPurchaseDate: string | null
  createdAt: Date
  updatedAt: Date
}

type CustomerSegmentRow = {
  id: string
  tenantId: string
  name: string
  description: string | null
  isDynamic: boolean | null
  rulesJson: unknown
  createdAt: Date
  updatedAt: Date
}

type CustomerMetricsRow = {
  id: string
  tenantId: string
  contactId: string
  churnRiskScore: string | null
  rfmScore: string | null
  npsScore: number | null
  customerSatisfactionScore: string | null
  calculatedAt: Date | null
}

export class LoyaltyMapper {
  static toDomain(row: LoyaltyProfileRow): LoyaltyProfile {
    return new LoyaltyProfile(
      row.id,
      row.tenantId,
      row.contactId,
      row.loyaltyPointsBalance ?? 0,
      row.tierLevel ?? "BRONZE",
      Number(row.totalLifetimeValue ?? "0"),
      row.totalPurchasesCount ?? 0,
      Number(row.averageOrderValue ?? "0"),
      row.lastPurchaseDate ? new Date(row.lastPurchaseDate) : null,
      row.createdAt,
      row.updatedAt,
    )
  }

  static toPersistence(profile: LoyaltyProfile): LoyaltyProfileRow {
    return {
      id: profile.id,
      tenantId: profile.tenantId,
      contactId: profile.contactId,
      loyaltyPointsBalance: profile.loyaltyPointsBalance,
      tierLevel: profile.tierLevel,
      totalLifetimeValue: profile.totalLifetimeValue.toString(),
      totalPurchasesCount: profile.totalPurchasesCount,
      averageOrderValue: profile.averageOrderValue.toString(),
      lastPurchaseDate: profile.lastPurchaseDate ? profile.lastPurchaseDate.toISOString().split('T')[0] : null,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }
  }

  static toResponse(profile: LoyaltyProfile) {
    return {
      id: profile.id,
      contactId: profile.contactId,
      loyaltyPointsBalance: profile.loyaltyPointsBalance,
      tierLevel: profile.tierLevel,
      totalLifetimeValue: profile.totalLifetimeValue,
      totalPurchasesCount: profile.totalPurchasesCount,
      averageOrderValue: profile.averageOrderValue,
      lastPurchaseDate: profile.lastPurchaseDate?.toISOString().split('T')[0] ?? null,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    }
  }
}

export class SegmentMapper {
  static toDomain(row: CustomerSegmentRow): CustomerSegment {
    return new CustomerSegment(
      row.id,
      row.tenantId,
      row.name,
      row.description,
      row.isDynamic ?? false,
      row.rulesJson as any,
      row.createdAt,
      row.updatedAt,
    )
  }

  static toPersistence(segment: CustomerSegment): CustomerSegmentRow {
    return {
      id: segment.id,
      tenantId: segment.tenantId,
      name: segment.name,
      description: segment.description,
      isDynamic: segment.isDynamic,
      rulesJson: segment.rulesJson,
      createdAt: segment.createdAt,
      updatedAt: segment.updatedAt,
    }
  }

  static toResponse(segment: CustomerSegment) {
    return {
      id: segment.id,
      name: segment.name,
      description: segment.description,
      isDynamic: segment.isDynamic,
      rulesJson: segment.rulesJson,
      createdAt: segment.createdAt.toISOString(),
      updatedAt: segment.updatedAt.toISOString(),
    }
  }
}

export class MetricsMapper {
  static toDomain(row: CustomerMetricsRow): CustomerMetrics {
    return new CustomerMetrics(
      row.id,
      row.tenantId,
      row.contactId,
      row.churnRiskScore ?? null ? Number(row.churnRiskScore ?? null) : null,
      row.rfmScore,
      row.npsScore,
      row.customerSatisfactionScore ?? null ? Number(row.customerSatisfactionScore ?? null) : null,
      row.calculatedAt,
    )
  }

  static toPersistence(metrics: CustomerMetrics): CustomerMetricsRow {
    return {
      id: metrics.id,
      tenantId: metrics.tenantId,
      contactId: metrics.contactId,
      churnRiskScore: metrics.churnRiskScore?.toString() ?? null,
      rfmScore: metrics.rfmScore,
      npsScore: metrics.npsScore,
      customerSatisfactionScore: metrics.customerSatisfactionScore?.toString() ?? null,
      calculatedAt: metrics.calculatedAt,
    }
  }

  static toResponse(metrics: CustomerMetrics) {
    return {
      id: metrics.id,
      contactId: metrics.contactId,
      churnRiskScore: metrics.churnRiskScore,
      rfmScore: metrics.rfmScore,
      npsScore: metrics.npsScore,
      customerSatisfactionScore: metrics.customerSatisfactionScore,
      calculatedAt: metrics.calculatedAt?.toISOString() ?? null,
    }
  }
}
