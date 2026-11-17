import { z } from 'zod'

export const ProductPricingTypeSchema = z.enum([
  'ONE_TIME',
  'MONTHLY_SUBSCRIPTION',
  'QUARTERLY_SUBSCRIPTION',
  'BIANNUAL_SUBSCRIPTION',
  'ANNUAL_SUBSCRIPTION',
  'USAGE_BASED',
  'TIERED_VOLUME',
  'CUSTOM_MILESTONE',
  'HOURLY_RATE',
  'RETAINER',
  'CUSTOM',
])
export type ProductPricingType = z.infer<typeof ProductPricingTypeSchema>

export const ProductSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  unitPrice: z.number().positive(),
  currency: z.string().default('USD'),
  pricingType: ProductPricingTypeSchema.default('ONE_TIME'),
  taxRate: z.number().nonnegative().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Product = z.infer<typeof ProductSchema>

export const CreateProductSchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  unitPrice: z.number().positive(),
  currency: z.string().default('USD').optional(),
  pricingType: ProductPricingTypeSchema.default('ONE_TIME').optional(),
  taxRate: z.number().nonnegative().default(0).optional(),
  isActive: z.boolean().default(true).optional(),
})
export type CreateProduct = z.infer<typeof CreateProductSchema>

export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  unitPrice: z.number().positive().optional(),
  currency: z.string().optional(),
  pricingType: ProductPricingTypeSchema.optional(),
  taxRate: z.number().nonnegative().optional(),
  isActive: z.boolean().optional(),
})
export type UpdateProduct = z.infer<typeof UpdateProductSchema>

export const ProductTemplateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  category: z.string().default('GENERAL'),
  defaultSkuPrefix: z.string().nullable().optional(),
  defaultUnitPrice: z.number().positive(),
  defaultCurrency: z.string().default('USD'),
  pricingType: ProductPricingTypeSchema.default('ONE_TIME'),
  defaultTaxRate: z.number().nonnegative().default(0),
  defaultDescription: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type ProductTemplate = z.infer<typeof ProductTemplateSchema>

export const CreateProductTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.string().default('GENERAL').optional(),
  defaultSkuPrefix: z.string().optional(),
  defaultUnitPrice: z.number().positive(),
  defaultCurrency: z.string().default('USD').optional(),
  pricingType: ProductPricingTypeSchema.default('ONE_TIME').optional(),
  defaultTaxRate: z.number().nonnegative().default(0).optional(),
  defaultDescription: z.string().optional(),
})
export type CreateProductTemplate = z.infer<typeof CreateProductTemplateSchema>

export const ApprovalStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED'])
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>

export const QuoteApprovalSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  quoteId: z.string().uuid(),
  requestedDiscountPercent: z.number().nonnegative().max(100),
  requestedByUserId: z.string().uuid(),
  approverUserId: z.string().uuid().nullable().optional(),
  status: ApprovalStatusSchema.default('PENDING'),
  rejectionReason: z.string().nullable().optional(),
  decidedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type QuoteApproval = z.infer<typeof QuoteApprovalSchema>

export const RequestQuoteApprovalSchema = z.object({
  quoteId: z.string().uuid(),
  requestedDiscountPercent: z.number().positive().max(100),
})
export type RequestQuoteApproval = z.infer<typeof RequestQuoteApprovalSchema>

export const DecideQuoteApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional(),
})
export type DecideQuoteApproval = z.infer<typeof DecideQuoteApprovalSchema>

export const SignatureStatusSchema = z.enum(['PENDING', 'OTP_VERIFIED', 'SIGNED', 'EXPIRED', 'DECLINED'])
export type SignatureStatus = z.infer<typeof SignatureStatusSchema>

export const ESignatureSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  documentId: z.string().uuid(),
  documentType: z.enum(['QUOTE', 'CONTRACT']).default('QUOTE'),
  signerName: z.string().min(1).max(200),
  signerEmail: z.string().email(),
  signerPhone: z.string().nullable().optional(),
  token: z.string().min(1),
  status: SignatureStatusSchema.default('PENDING'),
  signerIp: z.string().nullable().optional(),
  signerUserAgent: z.string().nullable().optional(),
  documentHashSha256: z.string().nullable().optional(),
  signatureDataUrl: z.string().nullable().optional(),
  signedAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type ESignature = z.infer<typeof ESignatureSchema>

export const CreateSignatureRequestSchema = z.object({
  documentId: z.string().uuid(),
  documentType: z.enum(['QUOTE', 'CONTRACT']).default('QUOTE').optional(),
  signerName: z.string().min(1).max(200),
  signerEmail: z.string().email(),
  signerPhone: z.string().optional(),
  expiresInDays: z.number().int().positive().default(7).optional(),
})
export type CreateSignatureRequest = z.infer<typeof CreateSignatureRequestSchema>

export const SubmitSignatureSchema = z.object({
  token: z.string().min(1),
  signatureDataUrl: z.string().min(1),
  signerIp: z.string().optional(),
  signerUserAgent: z.string().optional(),
})
export type SubmitSignature = z.infer<typeof SubmitSignatureSchema>
