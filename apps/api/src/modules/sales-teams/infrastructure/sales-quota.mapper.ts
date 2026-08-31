import { SalesQuota } from '../domain/entities/sales-quota.entity'

type SalesQuotaRow = {
  id: string
  tenantId: string
  userId: string
  teamId: string | null
  periodMonth: number
  periodYear: number
  targetAmount: string
  achievedAmount: string | null
  createdAt: Date
}

export class SalesQuotaMapper {
  static toDomain(row: SalesQuotaRow): SalesQuota {
    return new SalesQuota(
      row.id,
      row.tenantId,
      row.userId,
      row.teamId,
      row.periodMonth,
      row.periodYear,
      Number(row.targetAmount),
      row.achievedAmount ? Number(row.achievedAmount) : 0,
      row.createdAt,
    )
  }

  static toPersistence(quota: SalesQuota): SalesQuotaRow {
    return {
      id: quota.id,
      tenantId: quota.tenantId,
      userId: quota.userId,
      teamId: quota.teamId,
      periodMonth: quota.periodMonth,
      periodYear: quota.periodYear,
      targetAmount: quota.targetAmount.toString(),
      achievedAmount: quota.achievedAmount.toString(),
      createdAt: quota.createdAt,
    }
  }

  static toResponse(quota: SalesQuota) {
    return {
      id: quota.id,
      userId: quota.userId,
      teamId: quota.teamId,
      periodMonth: quota.periodMonth,
      periodYear: quota.periodYear,
      targetAmount: quota.targetAmount,
      achievedAmount: quota.achievedAmount,
      createdAt: quota.createdAt.toISOString(),
    }
  }
}
