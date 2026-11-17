import { CommissionsCalculatorHelper } from '../commissions-calculator.helper'
import type { CommissionPlan } from '@crm/contracts'

describe('CommissionsCalculatorHelper', () => {
  const mockAcceleratorPlan: CommissionPlan = {
    id: '00000000-0000-0000-0000-000000000001',
    tenantId: '00000000-0000-0000-0000-000000000001',
    name: 'Plan Accelerator',
    calculationModel: 'ACCELERATOR',
    baseRate: 5.0,
    acceleratorRate: 8.5,
    tierRules: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  it('should calculate base rate commission when quota < 100%', () => {
    const res = CommissionsCalculatorHelper.computeCommission(mockAcceleratorPlan, {
      dealId: '00000000-0000-0000-0000-000000000002',
      userId: '00000000-0000-0000-0000-000000000003',
      dealValue: 50000,
      quotaAttainmentPct: 85,
    })

    expect(res.rate).toBe(5.0)
    expect(res.amount).toBe(2500)
  })

  it('should apply accelerator rate when quota >= 100%', () => {
    const res = CommissionsCalculatorHelper.computeCommission(mockAcceleratorPlan, {
      dealId: '00000000-0000-0000-0000-000000000002',
      userId: '00000000-0000-0000-0000-000000000003',
      dealValue: 50000,
      quotaAttainmentPct: 110,
    })

    expect(res.rate).toBe(8.5)
    expect(res.amount).toBe(4250)
  })

  it('should calculate split deal correctly (50% split)', () => {
    const res = CommissionsCalculatorHelper.computeCommission(mockAcceleratorPlan, {
      dealId: '00000000-0000-0000-0000-000000000002',
      userId: '00000000-0000-0000-0000-000000000003',
      dealValue: 100000,
      splitPercentage: 50,
      quotaAttainmentPct: 90,
    })

    expect(res.rate).toBe(5.0)
    expect(res.amount).toBe(2500) // (100k * 0.5) * 5% = 2500
  })
})
