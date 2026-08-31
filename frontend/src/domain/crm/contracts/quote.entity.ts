import { Entity } from "../common/entities/base.entity"

export interface QuoteProps {
  tenantId: string
  dealId: string
  quoteNumber: string
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED"
  validUntil: string
  termsAndConditions: string | null
  subtotal: number | null
  taxTotal: number | null
  grandTotal: number | null
}

export class Quote extends Entity<QuoteProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get dealId(): string {
    return this.props.dealId
  }

  get quoteNumber(): string {
    return this.props.quoteNumber
  }

  get status(): "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" {
    return this.props.status
  }

  get validUntil(): string {
    return this.props.validUntil
  }

  get termsAndConditions(): string | null {
    return this.props.termsAndConditions
  }

  get subtotal(): number | null {
    return this.props.subtotal
  }

  get taxTotal(): number | null {
    return this.props.taxTotal
  }

  get grandTotal(): number | null {
    return this.props.grandTotal
  }

  static create(
    props: QuoteCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Quote {
    return new Quote(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      dealId: props.dealId,
      quoteNumber: props.quoteNumber,
      status: props.status ?? "DRAFT",
      validUntil: props.validUntil,
      termsAndConditions: props.termsAndConditions ?? null,
      subtotal: props.subtotal ?? null,
      taxTotal: props.taxTotal ?? null,
      grandTotal: props.grandTotal ?? null,
    })
  }

  send(): void {
    this.props.status = "SENT"
    this.touch()
  }

  accept(): void {
    this.props.status = "ACCEPTED"
    this.touch()
  }

  reject(): void {
    this.props.status = "REJECTED"
    this.touch()
  }
}

export interface QuoteCreateInput {
  tenantId: string
  dealId: string
  quoteNumber: string
  validUntil: string
  status?: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED"
  termsAndConditions?: string | null
  subtotal?: number | null
  taxTotal?: number | null
  grandTotal?: number | null
}
