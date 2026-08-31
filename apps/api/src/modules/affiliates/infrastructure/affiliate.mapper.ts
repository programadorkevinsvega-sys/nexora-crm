import { AffiliateProgram } from '../domain/entities/affiliate-program.entity'
import { Affiliate } from '../domain/entities/affiliate.entity'
import { AffiliateCommission } from '../domain/entities/affiliate-commission.entity'
import { AffiliatePayout } from '../domain/entities/affiliate-payout.entity'

type ProgramRow = {
  id: string
  tenantId: string
  name: string
  commissionType: string
  commissionValue: string
  cookieDurationDays: number | null
  isMultiLevel: boolean | null
  maxMlmLevels: number | null
  isActive: boolean | null
  createdAt: Date
  updatedAt: Date
}

type AffiliateRow = {
  id: string
  tenantId: string
  programId: string
  customerId: string
  referralCode: string
  referralLink: string
  parentAffiliateId: string | null
  mlmLevel: number | null
  status: string | null
  totalEarnings: string | null
  createdAt: Date
  updatedAt: Date
}

type CommissionRow = {
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

type PayoutRow = {
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

export class AffiliateMapper {
  static programToDomain(row: ProgramRow): AffiliateProgram {
    return new AffiliateProgram(
      row.id,
      row.tenantId,
      row.name,
      row.commissionType,
      Number(row.commissionValue),
      row.cookieDurationDays,
      row.isMultiLevel,
      row.maxMlmLevels,
      row.isActive,
      row.createdAt,
      row.updatedAt,
    )
  }

  static programToPersistence(program: AffiliateProgram): ProgramRow {
    return {
      id: program.id,
      tenantId: program.tenantId,
      name: program.name,
      commissionType: program.commissionType,
      commissionValue: program.commissionValue.toString(),
      cookieDurationDays: program.cookieDurationDays,
      isMultiLevel: program.isMultiLevel,
      maxMlmLevels: program.maxMlmLevels,
      isActive: program.isActive,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
    }
  }

  static programToResponse(program: AffiliateProgram) {
    return {
      id: program.id,
      tenantId: program.tenantId,
      name: program.name,
      commissionType: program.commissionType,
      commissionValue: program.commissionValue,
      cookieDurationDays: program.cookieDurationDays,
      isMultiLevel: program.isMultiLevel,
      maxMlmLevels: program.maxMlmLevels,
      isActive: program.isActive,
      createdAt: program.createdAt.toISOString(),
      updatedAt: program.updatedAt.toISOString(),
    }
  }

  static affiliateToDomain(row: AffiliateRow): Affiliate {
    return new Affiliate(
      row.id,
      row.tenantId,
      row.programId,
      row.customerId,
      row.referralCode,
      row.referralLink,
      row.parentAffiliateId,
      row.mlmLevel,
      row.status,
      row.totalEarnings ? Number(row.totalEarnings) : null,
      row.createdAt,
      row.updatedAt,
    )
  }

  static affiliateToPersistence(affiliate: Affiliate): AffiliateRow {
    return {
      id: affiliate.id,
      tenantId: affiliate.tenantId,
      programId: affiliate.programId,
      customerId: affiliate.customerId,
      referralCode: affiliate.referralCode,
      referralLink: affiliate.referralLink,
      parentAffiliateId: affiliate.parentAffiliateId,
      mlmLevel: affiliate.mlmLevel,
      status: affiliate.status,
      totalEarnings: affiliate.totalEarnings?.toString() ?? null,
      createdAt: affiliate.createdAt,
      updatedAt: affiliate.updatedAt,
    }
  }

  static affiliateToResponse(affiliate: Affiliate) {
    return {
      id: affiliate.id,
      tenantId: affiliate.tenantId,
      programId: affiliate.programId,
      customerId: affiliate.customerId,
      referralCode: affiliate.referralCode,
      referralLink: affiliate.referralLink,
      parentAffiliateId: affiliate.parentAffiliateId,
      mlmLevel: affiliate.mlmLevel,
      status: affiliate.status,
      totalEarnings: affiliate.totalEarnings,
      createdAt: affiliate.createdAt.toISOString(),
      updatedAt: affiliate.updatedAt.toISOString(),
    }
  }

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
