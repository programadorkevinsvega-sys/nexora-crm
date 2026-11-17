import type { CommissionPlan, CalculateCommissionDto } from '@crm/contracts'

export class CommissionsCalculatorHelper {
  static computeCommission(
    plan: CommissionPlan | null,
    dto: CalculateCommissionDto,
  ): { rate: number; amount: number } {
    let rate = plan ? Number(plan.baseRate) : 5.0
    const quotaPct = dto.quotaAttainmentPct || 100
    const splitPct = dto.splitPercentage ? dto.splitPercentage / 100 : 1.0

    if (plan?.calculationModel === 'TIERED_QUOTA' && Array.isArray(plan.tierRules)) {
      for (const tier of plan.tierRules) {
        if (quotaPct >= Number(tier.minQuotaPct) && Number(tier.rate) > rate) {
          rate = Number(tier.rate)
        }
      }
    } else if (plan?.calculationModel === 'ACCELERATOR') {
      if (quotaPct >= 100 && plan.acceleratorRate) {
        rate = Number(plan.acceleratorRate)
      }
    }

    const eligibleValue = dto.dealValue * splitPct
    const amount = Number(((eligibleValue * rate) / 100).toFixed(2))

    return { rate, amount }
  }
}
