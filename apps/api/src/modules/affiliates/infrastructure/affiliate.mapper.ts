import { AffiliateProgramMapper, ProgramRow, AffiliateRow } from './affiliate-program.mapper'
import { AffiliateCommissionMapper, CommissionRow, PayoutRow } from './affiliate-commission.mapper'
import { AffiliateProgram } from '../domain/entities/affiliate-program.entity'
import { Affiliate } from '../domain/entities/affiliate.entity'
import { AffiliateCommission } from '../domain/entities/affiliate-commission.entity'
import { AffiliatePayout } from '../domain/entities/affiliate-payout.entity'

export { ProgramRow, AffiliateRow, CommissionRow, PayoutRow }

export class AffiliateMapper {
  static programToDomain(row: ProgramRow): AffiliateProgram { return AffiliateProgramMapper.programToDomain(row) }
  static programToPersistence(program: AffiliateProgram): ProgramRow { return AffiliateProgramMapper.programToPersistence(program) }
  static programToResponse(program: AffiliateProgram) { return AffiliateProgramMapper.programToResponse(program) }

  static affiliateToDomain(row: AffiliateRow): Affiliate { return AffiliateProgramMapper.affiliateToDomain(row) }
  static affiliateToPersistence(affiliate: Affiliate): AffiliateRow { return AffiliateProgramMapper.affiliateToPersistence(affiliate) }
  static affiliateToResponse(affiliate: Affiliate) { return AffiliateProgramMapper.affiliateToResponse(affiliate) }

  static commissionToDomain(row: CommissionRow): AffiliateCommission { return AffiliateCommissionMapper.commissionToDomain(row) }
  static commissionToPersistence(commission: AffiliateCommission): CommissionRow { return AffiliateCommissionMapper.commissionToPersistence(commission) }
  static commissionToResponse(commission: AffiliateCommission) { return AffiliateCommissionMapper.commissionToResponse(commission) }

  static payoutToDomain(row: PayoutRow): AffiliatePayout { return AffiliateCommissionMapper.payoutToDomain(row) }
  static payoutToPersistence(payout: AffiliatePayout): PayoutRow { return AffiliateCommissionMapper.payoutToPersistence(payout) }
  static payoutToResponse(payout: AffiliatePayout) { return AffiliateCommissionMapper.payoutToResponse(payout) }
}
