import type {
  DiscountApprovalRule,
  QuoteApprovalRequest,
  RequestQuoteApprovalDto,
  CustomerQuoteAcceptance,
  SubmitCustomerQuoteAcceptanceDto,
} from '@crm/contracts'
import { api } from '../../api/api-client'

export class ApiQuotesApprovalRepository {
  static async listRules(): Promise<DiscountApprovalRule[]> {
    return api.get<DiscountApprovalRule[]>('/api/quotes-approval/rules')
  }

  static async listRequests(): Promise<QuoteApprovalRequest[]> {
    return api.get<QuoteApprovalRequest[]>('/api/quotes-approval/requests')
  }

  static async requestApproval(dto: RequestQuoteApprovalDto): Promise<QuoteApprovalRequest> {
    return api.post<QuoteApprovalRequest>('/api/quotes-approval/request', dto)
  }

  static async reviewApproval(
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
    notes?: string,
  ): Promise<QuoteApprovalRequest> {
    return api.post<QuoteApprovalRequest>(`/api/quotes-approval/requests/${requestId}/review`, { status, notes })
  }

  static async generateToken(quoteId: string): Promise<CustomerQuoteAcceptance> {
    return api.post<CustomerQuoteAcceptance>(`/api/quotes-approval/quotes/${quoteId}/token`)
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
