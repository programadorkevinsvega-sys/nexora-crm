export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'

export class Quote {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly dealId: string | null,
    readonly quoteNumber: string,
    readonly status: QuoteStatus,
    readonly validUntil: string,
    readonly termsAndConditions: string | null,
    readonly subtotal: number,
    readonly taxTotal: number,
    readonly grandTotal: number,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    dealId?: string | null
    quoteNumber: string
    validUntil: string
    termsAndConditions?: string | null
    subtotal: number
    taxTotal: number
    grandTotal: number
  }): Quote {
    return new Quote(
      crypto.randomUUID(),
      props.tenantId,
      props.dealId ?? null,
      props.quoteNumber,
      'DRAFT',
      props.validUntil,
      props.termsAndConditions ?? null,
      props.subtotal,
      props.taxTotal,
      props.grandTotal,
      new Date(),
      new Date(),
    )
  }

  isExpired(at: Date = new Date()): boolean {
    const expiry = /^\d{4}-\d{2}-\d{2}$/.test(this.validUntil)
      ? Date.parse(`${this.validUntil}T23:59:59.999Z`)
      : Date.parse(this.validUntil)
    return !Number.isFinite(expiry) || expiry < at.getTime()
  }

  updateStatus(status: QuoteStatus): Quote {
    return new Quote(
      this.id,
      this.tenantId,
      this.dealId,
      this.quoteNumber,
      status,
      this.validUntil,
      this.termsAndConditions,
      this.subtotal,
      this.taxTotal,
      this.grandTotal,
      this.createdAt,
      new Date(),
    )
  }
}
