import type { CreatePaymentLinkDto, PaymentTransaction } from '@crm/contracts'

export class ApiPaymentsRepository {
  static async createPaymentLink(dto: CreatePaymentLinkDto): Promise<PaymentTransaction> {
    const res = await fetch('/api/payments/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Error al generar enlace de pago')
    }
    return res.json()
  }

  static async listTransactions(
    resourceType?: string,
    resourceId?: string,
  ): Promise<PaymentTransaction[]> {
    const params = new URLSearchParams()
    if (resourceType) params.append('resourceType', resourceType)
    if (resourceId) params.append('resourceId', resourceId)

    const res = await fetch(`/api/payments/transactions?${params.toString()}`, {
      credentials: 'include',
    })
    if (!res.ok) return []
    return res.json()
  }
}
