import { QuoteApproval } from '../../domain/entities/quote-approval.entity'

describe('QuoteApproval Entity', () => {
  it('should initialize approval request in PENDING status', () => {
    const approval = QuoteApproval.request({
      tenantId: 'tenant-1',
      quoteId: 'quote-100',
      requestedDiscountPercent: 25,
      requestedByUserId: 'user-sales-rep',
    })

    expect(approval.status).toBe('PENDING')
    expect(approval.requestedDiscountPercent).toBe(25)
    expect(approval.decidedAt).toBeNull()
  })

  it('should approve discount request with approver ID and timestamp', () => {
    const approval = QuoteApproval.request({
      tenantId: 'tenant-1',
      quoteId: 'quote-100',
      requestedDiscountPercent: 25,
      requestedByUserId: 'user-sales-rep',
    })

    const approved = approval.approve('manager-user-id')
    expect(approved.status).toBe('APPROVED')
    expect(approved.approverUserId).toBe('manager-user-id')
    expect(approved.decidedAt).toBeInstanceOf(Date)
  })

  it('should reject discount request with reason', () => {
    const approval = QuoteApproval.request({
      tenantId: 'tenant-1',
      quoteId: 'quote-100',
      requestedDiscountPercent: 35,
      requestedByUserId: 'user-sales-rep',
    })

    const rejected = approval.reject('manager-user-id', 'Exceeds maximum allowable margin')
    expect(rejected.status).toBe('REJECTED')
    expect(rejected.rejectionReason).toBe('Exceeds maximum allowable margin')
  })
})
