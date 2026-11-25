import { api } from "../../api/api-client"
import { ProductPricingTypeSchema } from '@crm/contracts'
import type {
  Product,
  ProductTemplate,
  ProductPricingType,
  QuoteApproval,
  ESignature,
} from "@/src/domain/crm/cpq/cpq.entity"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function responseArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  return isRecord(value) && Array.isArray(value.data) ? value.data : []
}

function isProduct(value: unknown): value is Product {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.tenantId === "string"
    && typeof value.sku === "string"
    && typeof value.name === "string"
    && typeof value.unitPrice === "number"
    && typeof value.currency === "string"
    && ProductPricingTypeSchema.safeParse(value.pricingType).success
    && typeof value.taxRate === "number"
    && typeof value.isActive === "boolean"
    && typeof value.createdAt === "string"
    && typeof value.updatedAt === "string"
}

function isProductTemplate(value: unknown): value is ProductTemplate {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.tenantId === "string"
    && typeof value.name === "string"
    && typeof value.category === "string"
    && typeof value.defaultUnitPrice === "number"
    && typeof value.defaultCurrency === "string"
    && ProductPricingTypeSchema.safeParse(value.pricingType).success
    && typeof value.defaultTaxRate === "number"
    && typeof value.createdAt === "string"
    && typeof value.updatedAt === "string"
}

function isQuoteApproval(value: unknown): value is QuoteApproval {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.tenantId === "string"
    && typeof value.quoteId === "string"
    && typeof value.requestedDiscountPercent === "number"
    && typeof value.requestedByUserId === "string"
    && (value.status === "PENDING" || value.status === "APPROVED" || value.status === "REJECTED")
    && typeof value.createdAt === "string"
    && typeof value.updatedAt === "string"
}

export const ApiCpqRepository = {
  async listProducts(): Promise<Product[]> {
    return responseArray(await api.get<unknown>("/api/cpq/products")).filter(isProduct)
  },

  async createProduct(data: {
    sku: string
    name: string
    unitPrice: number
    description?: string
    currency?: string
    pricingType?: ProductPricingType
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
      pricingType?: ProductPricingType
      taxRate?: number
      isActive?: boolean
    },
  ): Promise<Product> {
    return api.put<Product>(`/api/cpq/products/${id}`, data)
  },

  async deleteProduct(id: string): Promise<void> {
    return api.delete<void>(`/api/cpq/products/${id}`)
  },

  async listTemplates(): Promise<ProductTemplate[]> {
    return responseArray(await api.get<unknown>("/api/cpq/templates")).filter(isProductTemplate)
  },

  async createTemplate(data: {
    name: string
    category?: string
    defaultSkuPrefix?: string
    defaultUnitPrice: number
    defaultCurrency?: string
    pricingType?: ProductPricingType
    defaultTaxRate?: number
    defaultDescription?: string
  }): Promise<ProductTemplate> {
    return api.post<ProductTemplate>("/api/cpq/templates", data)
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
    return responseArray(await api.get<unknown>("/api/cpq/approvals/pending")).filter(isQuoteApproval)
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
