import { DomainEvent } from '@crm/shared'

export class QuoteApprovalRequestedEvent extends DomainEvent {
  readonly aggregateType = 'quote_approval'
  readonly eventName = 'crm.quote.approval_requested'

  constructor(
    readonly aggregateId: string,
    readonly quoteId: string,
    readonly requestedDiscountPercent: number,
    readonly requestedByUserId: string,
  ) {
    super()
  }

  toPrimitives() {
    return {
      approvalId: this.aggregateId,
      quoteId: this.quoteId,
      requestedDiscountPercent: this.requestedDiscountPercent,
      requestedByUserId: this.requestedByUserId,
    }
  }
}

export class QuoteApprovedEvent extends DomainEvent {
  readonly aggregateType = 'quote_approval'
  readonly eventName = 'crm.quote.approved'

  constructor(
    readonly aggregateId: string,
    readonly quoteId: string,
    readonly approverUserId: string,
  ) {
    super()
  }

  toPrimitives() {
    return {
      approvalId: this.aggregateId,
      quoteId: this.quoteId,
      approverUserId: this.approverUserId,
    }
  }
}

export class DocumentSignatureCompletedEvent extends DomainEvent {
  readonly aggregateType = 'e_signature'
  readonly eventName = 'crm.contract.signed'

  constructor(
    readonly aggregateId: string,
    readonly documentId: string,
    readonly documentType: string,
    readonly signerEmail: string,
    readonly documentHashSha256?: string | null,
  ) {
    super()
  }

  toPrimitives() {
    return {
      signatureId: this.aggregateId,
      documentId: this.documentId,
      documentType: this.documentType,
      signerEmail: this.signerEmail,
      documentHashSha256: this.documentHashSha256,
    }
  }
}
