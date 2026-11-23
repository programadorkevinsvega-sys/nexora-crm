import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import Stripe from 'stripe'
import { asRecord, credentialString, errorMessage, type IntegrationCredentials } from './dispatcher-utils'

@Injectable()
export class StripeDispatcher {
  private readonly logger = new Logger(StripeDispatcher.name)
  private buildClient(secretKey: string): Stripe {
    if (!secretKey) throw new BadRequestException('Stripe Secret Key es requerida')
    return new Stripe(secretKey, { apiVersion: '2026-08-26.dahlia', typescript: true })
  }
  async test(creds: IntegrationCredentials, _recipient: string, _text: string): Promise<{ success: boolean; message: string; details?: unknown }> {
    const secretKey = credentialString(creds, 'secretKey')
    const currency = credentialString(creds, 'currency') || 'USD'
    if (!secretKey) throw new BadRequestException('Stripe Secret Key es requerida')
    const stripe = this.buildClient(secretKey)
    const isLive = secretKey.startsWith('sk_live_')
    const mode = isLive ? '🟢 PRODUCCIÓN' : '🟡 TEST'
    try {
      const balance = await stripe.balance.retrieve()
      const isLiveKey = secretKey.startsWith('sk_live_')
      const modeLabel = isLiveKey ? '🟢 PRODUCCIÓN' : '🟡 TEST'
      const available = (balance.available || []).map((item) => `${(item.amount / 100).toFixed(2)} ${item.currency.toUpperCase()}`).join(', ')
      this.logger.log(`Stripe verified | mode=${modeLabel}`)
      return { success: true, message: `Stripe conectado en modo ${modeLabel}. Balance disponible: ${available || '0.00 USD'}. Moneda base: ${currency}.`,
        details: { mode: isLiveKey ? 'live' : 'test', balance: available } }
    } catch (err: unknown) {
      const candidate = asRecord(err)
      const code = asRecord(candidate.raw).code ?? candidate.type ?? 'unknown'
      return { success: false, message: `Error de Stripe (${String(code)}): ${errorMessage(err)}` }
    }
  }
  async createPaymentLink(secretKey: string, amount: number, currency: string, description: string): Promise<{ url: string; id: string }> {
    const stripe = this.buildClient(secretKey)
    const price = await stripe.prices.create({ currency: currency.toLowerCase(), unit_amount: Math.round(amount * 100), product_data: { name: description } })
    const link = await stripe.paymentLinks.create({ line_items: [{ price: price.id, quantity: 1 }] })
    return { url: link.url!, id: link.id }
  }
}
