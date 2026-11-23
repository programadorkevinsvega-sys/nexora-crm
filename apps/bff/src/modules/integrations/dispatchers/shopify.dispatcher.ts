import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import { asRecord, credentialString, errorMessage, type IntegrationCredentials } from './dispatcher-utils'

const SHOPIFY_API_VERSION = '2024-10'
@Injectable()
export class ShopifyDispatcher {
  private readonly logger = new Logger(ShopifyDispatcher.name)
  private buildBaseUrl(shopUrl: string): string {
    const normalized = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    const domain = normalized.includes('.') ? normalized : `${normalized}.myshopify.com`
    return `https://${domain}/admin/api/${SHOPIFY_API_VERSION}`
  }
  private headers(accessToken: string): Record<string, string> {
    return { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json' }
  }
  async test(creds: IntegrationCredentials, _recipient: string, _text: string): Promise<{ success: boolean; message: string; details?: unknown }> {
    const shopUrl = credentialString(creds, 'shopUrl')
    const accessToken = credentialString(creds, 'accessToken')
    const syncCustomers = creds.syncCustomers
    const syncOrdersAsDeals = creds.syncOrdersAsDeals
    if (!shopUrl || !accessToken) throw new BadRequestException('shopUrl y accessToken son requeridos para Shopify')
    const baseUrl = this.buildBaseUrl(shopUrl)
    try {
      const shopRes = await fetch(`${baseUrl}/shop.json`, { headers: this.headers(accessToken) })
      if (!shopRes.ok) {
        const err: unknown = await shopRes.json().catch(() => ({ errors: shopRes.statusText }))
        const errors = asRecord(err).errors
        return { success: false, message: `Shopify rechazó las credenciales (${shopRes.status}): ${typeof errors === 'string' ? errors : JSON.stringify(err)}` }
      }
      const response: unknown = await shopRes.json()
      const shop = asRecord(asRecord(response).shop)
      const shopName = typeof shop.name === 'string' ? shop.name : shopUrl
      const shopDomain = typeof shop.domain === 'string' ? shop.domain : shopUrl
      const [custRes, ordRes] = await Promise.allSettled([
        fetch(`${baseUrl}/customers/count.json`, { headers: this.headers(accessToken) }),
        fetch(`${baseUrl}/orders/count.json?status=any`, { headers: this.headers(accessToken) }),
      ])
      const readCount = async (item: PromiseSettledResult<Response>): Promise<number | string> => {
        if (item.status !== 'fulfilled' || !item.value.ok) return 'N/A'
        const body: unknown = await item.value.json()
        const count = asRecord(body).count
        return typeof count === 'number' ? count : 'N/A'
      }
      const [customerCount, orderCount] = await Promise.all([readCount(custRes), readCount(ordRes)])
      this.logger.log(`Shopify verified: ${shopDomain} | customers=${customerCount}`)
      return { success: true,
        message: `Tienda Shopify "${shopName}" conectada (${shopDomain}). Clientes: ${customerCount}, Pedidos: ${orderCount}. Sync: Clientes=${syncCustomers ?? true}, Pedidos→Deals=${syncOrdersAsDeals ?? true}`,
        details: { name: shopName, domain: shopDomain, customerCount, orderCount } }
    } catch (err: unknown) {
      return { success: false, message: `Error conectando con Shopify (${shopUrl}): ${errorMessage(err)}` }
    }
  }
  async getCustomers(shopUrl: string, accessToken: string, limit = 50): Promise<unknown[]> {
    const res = await fetch(`${this.buildBaseUrl(shopUrl)}/customers.json?limit=${limit}`, { headers: this.headers(accessToken) })
    if (!res.ok) throw new Error(`Shopify customers fetch failed: ${res.statusText}`)
    const data: unknown = await res.json()
    const customers = asRecord(data).customers
    return Array.isArray(customers) ? customers : []
  }
}
