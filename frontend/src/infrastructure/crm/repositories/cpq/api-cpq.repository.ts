import { api } from "../../api/api-client"
import type { Product, QuoteApproval, ESignature } from "@/src/domain/crm/cpq/cpq.entity"

export const ApiCpqRepository = {
  async listProducts(): Promise<Product[]> {
    const res = await api.get<any>("/api/cpq/products")
    return Array.isArray(res) ? res : []
  },

  async createProduct(data: {
    sku: string
    name: string
    unitPrice: number
    description?: string
    currency?: string
    pricingType?: string
    taxRate?: number
  }): Promise<Product> {
    return api.post<Product>("/api/cpq/products", data)
  },

  async updateProduct(
    id: string,
    data: {
      name?: string
      unitPrice?: number
      description?: string | null
      currency?: string
      pricingType?: string
      taxRate?: number
      isActive?: boolean
    },
  ): Promise<Product> {
    return api.put<Product>(`/api/cpq/products/${id}`, data)
  },

  async deleteProduct(id: string): Promise<void> {
    return api.delete<void>(`/api/cpq/products/${id}`)
  },

  async listTemplates(): Promise<any[]> {
    const res = await api.get<any>("/api/cpq/templates")
    return Array.isArray(res) ? res : []
  },

  async createTemplate(data: {
    name: string
    category?: string
    defaultSkuPrefix?: string
    defaultUnitPrice: number
    defaultCurrency?: string
    pricingType?: string
    defaultTaxRate?: number
    defaultDescription?: string
  }): Promise<any> {
    return api.post<any>("/api/cpq/templates", data)
  },

  async deleteTemplate(id: string): Promise<void> {
    return api.delete<void>(`/api/cpq/templates/${id}`)
  },

  async requestApproval(data: {
    quoteId: string
    requestedDiscountPercent: number
  }): Promise<{ id: string; status: string }> {
    return api.post<{ id: string; status: string }>("/api/cpq/approvals/request", data)
  },

  async decideApproval(
    approvalId: string,
    data: { status: "APPROVED" | "REJECTED"; rejectionReason?: string },
  ): Promise<QuoteApproval> {
    return api.post<QuoteApproval>(`/api/cpq/approvals/${approvalId}/decide`, data)
  },

  async listPendingApprovals(): Promise<QuoteApproval[]> {
    const res = await api.get<any>("/api/cpq/approvals/pending")
    return Array.isArray(res) ? res : []
  },

  async initiateSignature(data: {
    documentId: string
    signerName: string
    signerEmail: string
    documentType?: "QUOTE" | "CONTRACT"
    signerPhone?: string
    expiresInDays?: number
  }): Promise<ESignature> {
    return api.post<ESignature>("/api/cpq/signatures/initiate", data)
  },

  async verifyOtp(token: string, otpCode: string): Promise<{ success: boolean }> {
    return api.post<{ success: boolean }>(`/api/cpq/signatures/${token}/verify-otp`, { otpCode })
  },

  async submitSignature(data: {
    token: string
    signatureDataUrl: string
  }): Promise<ESignature> {
    return api.post<ESignature>("/api/cpq/signatures/submit", data)
  },

  async getSignatureByToken(token: string): Promise<ESignature> {
    return api.get<ESignature>(`/api/cpq/signatures/${token}`)
  },
}
