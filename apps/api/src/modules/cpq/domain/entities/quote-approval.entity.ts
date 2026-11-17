import { ApprovalStatus } from '@crm/contracts'

export class QuoteApproval {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly quoteId: string,
    readonly requestedDiscountPercent: number,
    readonly requestedByUserId: string,
    readonly approverUserId: string | null,
    readonly status: ApprovalStatus,
    readonly rejectionReason: string | null,
    readonly decidedAt: Date | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static request(props: {
    tenantId: string
    quoteId: string
    requestedDiscountPercent: number
    requestedByUserId: string
  }): QuoteApproval {
    if (props.requestedDiscountPercent <= 0 || props.requestedDiscountPercent > 100) {
      throw new Error('Discount percent must be between 0 and 100')
    }

    return new QuoteApproval(
      crypto.randomUUID(),
      props.tenantId,
      props.quoteId,
      props.requestedDiscountPercent,
      props.requestedByUserId,
      null,
      'PENDING',
      null,
      null,
      new Date(),
      new Date(),
    )
  }

  approve(approverUserId: string): QuoteApproval {
    return new QuoteApproval(
      this.id,
      this.tenantId,
      this.quoteId,
      this.requestedDiscountPercent,
      this.requestedByUserId,
      approverUserId,
      'APPROVED',
      null,
      new Date(),
      this.createdAt,
      new Date(),
    )
  }

  reject(approverUserId: string, reason: string): QuoteApproval {
    return new QuoteApproval(
      this.id,
      this.tenantId,
      this.quoteId,
      this.requestedDiscountPercent,
      this.requestedByUserId,
      approverUserId,
      'REJECTED',
      reason,
      new Date(),
      this.createdAt,
      new Date(),
    )
  }
}
