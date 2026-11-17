import type {
  DiscountApprovalRule,
  CreateDiscountApprovalRuleDto,
  QuoteApprovalRequest,
  RequestQuoteApprovalDto,
  CustomerQuoteAcceptance,
  SubmitCustomerQuoteAcceptanceDto,
} from '@crm/contracts'

export class ApiQuotesApprovalRepository {
  static async listRules(): Promise<DiscountApprovalRule[]> {
    const res = await fetch('/api/quotes-approval/rules', { credentials: 'include' })
    if (!res.ok) throw new Error('Error al listar reglas de descuento')
    return res.json()
  }

  static async listRequests(): Promise<QuoteApprovalRequest[]> {
    const res = await fetch('/api/quotes-approval/requests', { credentials: 'include' })
    if (!res.ok) throw new Error('Error al listar solicitudes de aprobación')
    return res.json()
  }

  static async requestApproval(dto: RequestQuoteApprovalDto): Promise<QuoteApprovalRequest> {
    const res = await fetch('/api/quotes-approval/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error('Error al solicitar aprobación')
    return res.json()
  }

  static async reviewApproval(
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
    notes?: string,
  ): Promise<QuoteApprovalRequest> {
    const res = await fetch(`/api/quotes-approval/requests/${requestId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status, notes }),
    })
    if (!res.ok) throw new Error('Error al evaluar aprobación')
    return res.json()
  }

  static async generateToken(quoteId: string): Promise<CustomerQuoteAcceptance> {
    const res = await fetch(`/api/quotes-approval/quotes/${quoteId}/token`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al generar enlace público de cotización')
    return res.json()
  }

  static async getPublicQuote(token: string): Promise<CustomerQuoteAcceptance> {
    const res = await fetch(`/api/quotes-approval/public/${token}`)
    if (!res.ok) throw new Error('Cotización no encontrada o enlace expirado')
    return res.json()
  }

  static async submitPublicAcceptance(
    token: string,
    dto: SubmitCustomerQuoteAcceptanceDto,
  ): Promise<CustomerQuoteAcceptance> {
    const res = await fetch(`/api/quotes-approval/public/${token}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error('Error al procesar firma de cotización')
    return res.json()
  }
}
