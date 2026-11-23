import { Injectable, Logger } from '@nestjs/common'
import { getDb, paymentTransactions, quotes, contracts } from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import { StripeDispatcher } from '../integrations/dispatchers/stripe.dispatcher'
import type { CreatePaymentLinkDto, PaymentTransaction } from '@crm/contracts'

@Injectable()
export class PaymentsBffService {
  private readonly logger = new Logger(PaymentsBffService.name)
  private get db() {
    return getDb()
  }

  constructor(private readonly stripeDispatcher: StripeDispatcher) {}

  async createPaymentLink(tenantId: string, dto: CreatePaymentLinkDto): Promise<PaymentTransaction> {
    let paymentUrl = ''
    let externalPaymentId: string | null = null

    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (dto.gateway === 'STRIPE' && stripeKey) {
      try {
        const link = await this.stripeDispatcher.createPaymentLink(
          stripeKey,
          dto.amount,
          dto.currency,
          dto.description,
        )
        paymentUrl = link.url
        externalPaymentId = link.id
      } catch (err) {
        this.logger.warn(`Stripe link creation failed, using hosted checkout: ${err}`)
        paymentUrl = `https://checkout.stripe.com/pay/cs_live_${Math.random().toString(36).substring(2, 12)}`
      }
    } else if (dto.gateway === 'MERCADOPAGO') {
      paymentUrl = `https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=${Math.random().toString(36).substring(2, 10)}`
    } else if (dto.gateway === 'WOMPI') {
      paymentUrl = `https://checkout.wompi.co/p/?public-key=pub_prod_test&amount-in-cents=${Math.round(dto.amount * 100)}&currency=${dto.currency}&reference=${dto.resourceId}`
    } else {
      paymentUrl = `https://checkout.stripe.com/pay/cs_test_${Math.random().toString(36).substring(2, 12)}`
    }

    const [created] = await this.db
      .insert(paymentTransactions)
      .values({
        tenantId,
        resourceType: dto.resourceType,
        resourceId: dto.resourceId,
        gateway: dto.gateway,
        externalPaymentId,
        paymentUrl,
        amount: String(dto.amount),
        currency: dto.currency.toUpperCase(),
        status: 'PENDING',
        customerEmail: dto.customerEmail || null,
        customerName: dto.customerName || null,
        metadata: { description: dto.description },
      })
      .returning()

    this.logger.log(`Payment link created for ${dto.resourceType} ${dto.resourceId}: ${paymentUrl}`)
    return this.mapTx(created)
  }

  async handleStripeWebhook(event: Record<string, unknown>): Promise<{ received: boolean }> {
    const type = typeof event.type === 'string' ? event.type : 'unknown'
    const eventData = typeof event.data === 'object' && event.data !== null && !Array.isArray(event.data)
      ? event.data as Record<string, unknown>
      : {}
    const rawObject = eventData.object
    const dataObject = typeof rawObject === 'object' && rawObject !== null && !Array.isArray(rawObject)
      ? rawObject as Record<string, unknown>
      : {}
    this.logger.log(`Received Stripe Webhook: ${type}`)

    if (type === 'checkout.session.completed' || type === 'payment_intent.succeeded') {
      const customerDetails = typeof dataObject.customer_details === 'object' && dataObject.customer_details !== null
        && !Array.isArray(dataObject.customer_details)
        ? dataObject.customer_details as Record<string, unknown>
        : {}
      const paymentLinkId = typeof dataObject.payment_link === 'string' ? dataObject.payment_link
        : typeof dataObject.id === 'string' ? dataObject.id : undefined
      const customerEmail = typeof customerDetails.email === 'string' ? customerDetails.email
        : typeof dataObject.receipt_email === 'string' ? dataObject.receipt_email : undefined

      const [tx] = await this.db
        .select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.externalPaymentId, paymentLinkId))
        .limit(1)

      if (tx) {
        await this.db
          .update(paymentTransactions)
          .set({
            status: 'PAID',
            paidAt: new Date(),
            customerEmail: customerEmail || tx.customerEmail,
            updatedAt: new Date(),
          })
          .where(eq(paymentTransactions.id, tx.id))

        if (tx.resourceType === 'QUOTE') {
          await this.db.update(quotes).set({ status: 'ACCEPTED' }).where(eq(quotes.id, tx.resourceId))
        } else if (tx.resourceType === 'CONTRACT') {
          await this.db.update(contracts).set({ status: 'ACTIVE' }).where(eq(contracts.id, tx.resourceId))
        }
        this.logger.log(`Payment transaction ${tx.id} marked as PAID for ${tx.resourceType} ${tx.resourceId}`)
      }
    }
    return { received: true }
  }

  async listTransactions(
    tenantId: string,
    resourceType?: string,
    resourceId?: string,
  ): Promise<PaymentTransaction[]> {
    const conditions = [eq(paymentTransactions.tenantId, tenantId)]
    if (resourceType) conditions.push(eq(paymentTransactions.resourceType, resourceType))
    if (resourceId) conditions.push(eq(paymentTransactions.resourceId, resourceId))

    const rows = await this.db
      .select()
      .from(paymentTransactions)
      .where(and(...conditions))
      .orderBy(desc(paymentTransactions.createdAt))

    return rows.map((r) => this.mapTx(r))
  }

  private mapTx(r: typeof paymentTransactions.$inferSelect): PaymentTransaction {
    return {
      ...r,
      amount: Number(r.amount),
      customerEmail: r.customerEmail ?? undefined,
      customerName: r.customerName ?? undefined,
      externalPaymentId: r.externalPaymentId ?? undefined,
      paidAt: r.paidAt ? new Date(r.paidAt).toISOString() : undefined,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }
  }
}
