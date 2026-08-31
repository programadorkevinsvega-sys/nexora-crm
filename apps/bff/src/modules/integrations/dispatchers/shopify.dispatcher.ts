import { Injectable, BadRequestException, Logger } from '@nestjs/common'

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
    return {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    }
  }

  async test(
    creds: Record<string, any>,
    _recipient: string,
    _text: string,
  ): Promise<{ success: boolean; message: string; details?: any }> {
    const { shopUrl, accessToken, syncCustomers, syncOrdersAsDeals } = creds

    if (!shopUrl || !accessToken) {
      throw new BadRequestException('shopUrl y accessToken son requeridos para Shopify')
    }

    const baseUrl = this.buildBaseUrl(shopUrl)

    try {
      const shopRes = await fetch(`${baseUrl}/shop.json`, {
        headers: this.headers(accessToken),
      })

      if (!shopRes.ok) {
        const err = await shopRes.json().catch(() => ({ errors: shopRes.statusText }))
        return {
          success: false,
          message: `Shopify rechazó las credenciales (${shopRes.status}): ${JSON.stringify((err as any).errors || err)}`,
        }
      }

      const { shop } = await shopRes.json()

      const [custRes, ordRes] = await Promise.allSettled([
        fetch(`${baseUrl}/customers/count.json`, { headers: this.headers(accessToken) }),
        fetch(`${baseUrl}/orders/count.json?status=any`, { headers: this.headers(accessToken) }),
      ])

      const customerCount =
        custRes.status === 'fulfilled' && custRes.value.ok
          ? (await custRes.value.json()).count
          : 'N/A'
      const orderCount =
        ordRes.status === 'fulfilled' && ordRes.value.ok
          ? (await ordRes.value.json()).count
          : 'N/A'

      this.logger.log(`Shopify verified: ${shop.domain} | customers=${customerCount}`)
      return {
        success: true,
        message: `Tienda Shopify "${shop.name}" conectada (${shop.domain}). Clientes: ${customerCount}, Pedidos: ${orderCount}. Sync: Clientes=${syncCustomers ?? true}, Pedidos→Deals=${syncOrdersAsDeals ?? true}`,
        details: { name: shop.name, domain: shop.domain, customerCount, orderCount },
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Error conectando con Shopify (${shopUrl}): ${err.message}`,
      }
    }
  }

  async getCustomers(
    shopUrl: string,
    accessToken: string,
    limit = 50,
  ): Promise<any[]> {
    const baseUrl = this.buildBaseUrl(shopUrl)
    const res = await fetch(`${baseUrl}/customers.json?limit=${limit}`, {
      headers: this.headers(accessToken),
    })
    if (!res.ok) throw new Error(`Shopify customers fetch failed: ${res.statusText}`)
    const data = await res.json()
    return (data as any).customers || []
  }
}
