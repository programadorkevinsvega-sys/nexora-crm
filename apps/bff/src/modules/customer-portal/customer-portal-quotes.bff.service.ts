import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import type { Deal, Quote } from '@crm/contracts'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator'
import { resolveCustomerPortalIdentity } from './customer-portal.identity'

export interface CustomerPortalQuoteView {
  id: string
  dealId: string
  dealName: string
  quoteNumber: string
  status: string
  validUntil: string
  isExpired: boolean
  termsAndConditions: string | null
  subtotal: number
  taxTotal: number
  grandTotal: number
  currency: string
  createdAt: string
  updatedAt: string
}

@Injectable()
export class CustomerPortalQuotesBffService {
  constructor(private readonly api: ApiCoreGrpcClient) {}

  private async getOwnedQuote(user: AuthenticatedUser | undefined, quoteId: string) {
    const identity = resolveCustomerPortalIdentity(user)
    const quote = await this.api.getQuote(identity.tenantId, quoteId)

    if (quote.tenantId !== identity.tenantId || quote.status === 'DRAFT' || !quote.dealId) {
      throw new NotFoundException('Quote not found')
    }

    const deal = await this.api.getDeal(identity.tenantId, quote.dealId)
    if (deal.tenantId !== identity.tenantId || deal.contactId !== identity.contactId) {
      throw new NotFoundException('Quote not found')
    }

    return { identity, quote, deal }
  }

  private isExpired(validUntil: string): boolean {
    const expiry = /^\d{4}-\d{2}-\d{2}$/.test(validUntil)
      ? Date.parse(`${validUntil}T23:59:59.999Z`)
      : Date.parse(validUntil)
    return !Number.isFinite(expiry) || expiry < Date.now()
  }

  private toPortalQuote(quote: Quote, deal: Deal): CustomerPortalQuoteView {
    return {
      id: quote.id,
      dealId: deal.id,
      dealName: deal.name,
      quoteNumber: quote.quoteNumber,
      status: quote.status,
      validUntil: quote.validUntil,
      isExpired: quote.status === 'SENT' && this.isExpired(quote.validUntil),
      termsAndConditions: quote.termsAndConditions,
      subtotal: quote.subtotal,
      taxTotal: quote.taxTotal,
      grandTotal: quote.grandTotal,
      currency: deal.currency || 'USD',
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
    }
  }

  private assertCanDecide(quote: Quote): void {
    if (quote.status !== 'SENT') {
      throw new ConflictException('Only sent quotes can be accepted or rejected')
    }
    if (this.isExpired(quote.validUntil)) {
      throw new ConflictException('This quote has expired and can no longer be accepted or rejected')
    }
  }

  private actorId(user: AuthenticatedUser | undefined): string {
    const actorId = user?.sub || user?.userId
    if (!actorId) throw new ForbiddenException('A verified customer portal account is required')
    return actorId
  }

  async getQuote(user: AuthenticatedUser | undefined, quoteId: string): Promise<CustomerPortalQuoteView> {
    const { quote, deal } = await this.getOwnedQuote(user, quoteId)
    return this.toPortalQuote(quote, deal)
  }

  async acceptQuote(user: AuthenticatedUser | undefined, quoteId: string): Promise<CustomerPortalQuoteView> {
    const { identity, quote } = await this.getOwnedQuote(user, quoteId)
    this.assertCanDecide(quote)

    await this.api.acceptQuote({
      tenantId: identity.tenantId,
      id: quoteId,
      actorId: this.actorId(user),
      actorType: 'CUSTOMER_PORTAL',
    })

    return this.getQuote(user, quoteId)
  }

  async rejectQuote(user: AuthenticatedUser | undefined, quoteId: string, reason: string): Promise<CustomerPortalQuoteView> {
    const normalizedReason = reason.trim()
    if (normalizedReason.length < 10) {
      throw new BadRequestException('Please provide a rejection reason with at least 10 characters')
    }

    const { identity, quote } = await this.getOwnedQuote(user, quoteId)
    this.assertCanDecide(quote)

    await this.api.rejectQuote({
      tenantId: identity.tenantId,
      id: quoteId,
      reason: normalizedReason,
      actorId: this.actorId(user),
      actorType: 'CUSTOMER_PORTAL',
    })

    return this.getQuote(user, quoteId)
  }
}
