import { AffiliateProgram } from '../domain/entities/affiliate-program.entity'
import { Affiliate } from '../domain/entities/affiliate.entity'

export type ProgramRow = {
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

export type AffiliateRow = {
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

export class AffiliateProgramMapper {
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
}
