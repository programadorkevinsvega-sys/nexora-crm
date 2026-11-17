import { ApproverRoleSchema, RequestQuoteApprovalDtoSchema } from '@crm/contracts'

describe('Quotes Approval Contracts & Thresholds', () => {
  it('should validate approver roles', () => {
    expect(ApproverRoleSchema.parse('SALES_MANAGER')).toBe('SALES_MANAGER')
    expect(ApproverRoleSchema.parse('VP_SALES')).toBe('VP_SALES')
    expect(ApproverRoleSchema.parse('CFO')).toBe('CFO')
  })

  it('should validate quote approval request schema', () => {
    const valid = RequestQuoteApprovalDtoSchema.parse({
      quoteId: '00000000-0000-0000-0000-000000000001',
      requestedDiscountPct: 25,
    })
    expect(valid.requestedDiscountPct).toBe(25)
  })
})
