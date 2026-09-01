import { AffiliateCommission } from '../domain/entities/affiliate-commission.entity'
import { AffiliatePayout } from '../domain/entities/affiliate-payout.entity'

export type CommissionRow = {
  id: string
  tenantId: string
  affiliateId: string
  sourceOrderId: string
  commissionAmount: string
  mlmLevelEarned: number | null
  status: string | null
  approvedAt: Date | null
  createdAt: Date
}

export type PayoutRow = {
  id: string
  tenantId: string
  affiliateId: string
  amount: string
  paymentMethod: string | null
  paymentReference: string | null
  status: string | null
  paidAt: Date | null
  createdAt: Date
}

export class AffiliateCommissionMapper {
  static commissionToDomain(row: CommissionRow): AffiliateCommission {
    return new AffiliateCommission(
      row.id,
      row.tenantId,
      row.affiliateId,
      row.sourceOrderId,
      Number(row.commissionAmount),
      row.mlmLevelEarned,
      row.status,
      row.approvedAt,
      row.createdAt,
    )
  }

  static commissionToPersistence(commission: AffiliateCommission): CommissionRow {
    return {
      id: commission.id,
      tenantId: commission.tenantId,
      affiliateId: commission.affiliateId,
      sourceOrderId: commission.sourceOrderId,
      commissionAmount: commission.commissionAmount.toString(),
      mlmLevelEarned: commission.mlmLevelEarned,
      status: commission.status,
      approvedAt: commission.approvedAt,
      createdAt: commission.createdAt,
    }
  }

  static commissionToResponse(commission: AffiliateCommission) {
    return {
      id: commission.id,
      affiliateId: commission.affiliateId,
      sourceOrderId: commission.sourceOrderId,
      commissionAmount: commission.commissionAmount,
      mlmLevelEarned: commission.mlmLevelEarned,
      status: commission.status,
      approvedAt: commission.approvedAt?.toISOString() ?? null,
      createdAt: commission.createdAt.toISOString(),
    }
  }

  static payoutToDomain(row: PayoutRow): AffiliatePayout {
    return new AffiliatePayout(
      row.id,
      row.tenantId,
      row.affiliateId,
      Number(row.amount),
      row.paymentMethod,
      row.paymentReference,
      row.status,
      row.paidAt,
      row.createdAt,
    )
  }

  static payoutToPersistence(payout: AffiliatePayout): PayoutRow {
    return {
      id: payout.id,
      tenantId: payout.tenantId,
      affiliateId: payout.affiliateId,
      amount: payout.amount.toString(),
      paymentMethod: payout.paymentMethod,
      paymentReference: payout.paymentReference,
      status: payout.status,
      paidAt: payout.paidAt,
      createdAt: payout.createdAt,
    }
  }

  static payoutToResponse(payout: AffiliatePayout) {
    return {
      id: payout.id,
      affiliateId: payout.affiliateId,
      amount: payout.amount,
      paymentMethod: payout.paymentMethod,
      paymentReference: payout.paymentReference,
      status: payout.status,
      paidAt: payout.paidAt?.toISOString() ?? null,
      createdAt: payout.createdAt.toISOString(),
    }
  }
}
