export type ProductPricingType =
  | 'ONE_TIME'
  | 'MONTHLY_SUBSCRIPTION'
  | 'QUARTERLY_SUBSCRIPTION'
  | 'BIANNUAL_SUBSCRIPTION'
  | 'ANNUAL_SUBSCRIPTION'
  | 'USAGE_BASED'
  | 'TIERED_VOLUME'
  | 'CUSTOM_MILESTONE'
  | 'HOURLY_RATE'
  | 'RETAINER'
  | 'CUSTOM'

export interface ProductTemplate {
  id: string
  tenantId: string
  name: string
  category: string
  defaultSkuPrefix?: string | null
  defaultUnitPrice: number
  defaultCurrency: string
  pricingType: ProductPricingType
  defaultTaxRate: number
  defaultDescription?: string | null
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  tenantId: string
  sku: string
  name: string
  description?: string | null
  unitPrice: number
  currency: string
  pricingType: ProductPricingType
  taxRate: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface QuoteApproval {
  id: string
  tenantId: string
  quoteId: string
  requestedDiscountPercent: number
  requestedByUserId: string
  approverUserId?: string | null
  status: ApprovalStatus
  rejectionReason?: string | null
  decidedAt?: string | null
  createdAt: string
  updatedAt: string
}

export type SignatureStatus = 'PENDING' | 'OTP_VERIFIED' | 'SIGNED' | 'EXPIRED' | 'DECLINED'

export interface ESignature {
  id: string
  tenantId: string
  documentId: string
  documentType: 'QUOTE' | 'CONTRACT'
  signerName: string
  signerEmail: string
  signerPhone?: string | null
  token: string
  status: SignatureStatus
  signerIp?: string | null
  signerUserAgent?: string | null
  documentHashSha256?: string | null
  signatureDataUrl?: string | null
  signedAt?: string | null
  expiresAt: string
  createdAt: string
  updatedAt: string
}
