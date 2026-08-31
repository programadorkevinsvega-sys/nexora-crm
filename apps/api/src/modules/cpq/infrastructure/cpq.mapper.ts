import { Product } from '../domain/entities/product.entity'
import { QuoteApproval } from '../domain/entities/quote-approval.entity'
import { ESignature } from '../domain/entities/e-signature.entity'
import { ProductPricingType, ApprovalStatus, SignatureStatus } from '@crm/contracts'

export class CpqMapper {
  static productToDomain(row: any): Product {
    return new Product(
      row.id,
      row.tenantId,
      row.sku,
      row.name,
      row.description ?? null,
      Number(row.unitPrice),
      row.currency ?? 'USD',
      row.pricingType as ProductPricingType,
      Number(row.taxRate ?? 0),
      row.isActive,
      new Date(row.createdAt),
      new Date(row.updatedAt),
    )
  }

  static quoteApprovalToDomain(row: any): QuoteApproval {
    return new QuoteApproval(
      row.id,
      row.tenantId,
      row.quoteId,
      Number(row.requestedDiscountPercent),
      row.requestedByUserId,
      row.approverUserId ?? null,
      row.status as ApprovalStatus,
      row.rejectionReason ?? null,
      row.decidedAt ? new Date(row.decidedAt) : null,
      new Date(row.createdAt),
      new Date(row.updatedAt),
    )
  }

  static signatureToDomain(row: any): ESignature {
    return new ESignature(
      row.id,
      row.tenantId,
      row.documentId,
      row.documentType as 'QUOTE' | 'CONTRACT',
      row.signerName,
      row.signerEmail,
      row.signerPhone ?? null,
      row.token,
      row.otpCode ?? null,
      row.status as SignatureStatus,
      row.signerIp ?? null,
      row.signerUserAgent ?? null,
      row.documentHashSha256 ?? null,
      row.signatureDataUrl ?? null,
      row.signedAt ? new Date(row.signedAt) : null,
      new Date(row.expiresAt),
      new Date(row.createdAt),
      new Date(row.updatedAt),
    )
  }

  static productToResponse(p: Product) {
    return {
      id: p.id,
      tenantId: p.tenantId,
      sku: p.sku,
      name: p.name,
      description: p.description,
      unitPrice: p.unitPrice,
      currency: p.currency,
      pricingType: p.pricingType,
      taxRate: p.taxRate,
      isActive: p.isActive,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }
  }

  static approvalToResponse(a: QuoteApproval) {
    return {
      id: a.id,
      tenantId: a.tenantId,
      quoteId: a.quoteId,
      requestedDiscountPercent: a.requestedDiscountPercent,
      requestedByUserId: a.requestedByUserId,
      approverUserId: a.approverUserId,
      status: a.status,
      rejectionReason: a.rejectionReason,
      decidedAt: a.decidedAt?.toISOString() ?? null,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }
  }

  static signatureToResponse(s: ESignature) {
    return {
      id: s.id,
      tenantId: s.tenantId,
      documentId: s.documentId,
      documentType: s.documentType,
      signerName: s.signerName,
      signerEmail: s.signerEmail,
      signerPhone: s.signerPhone,
      token: s.token,
      status: s.status,
      signerIp: s.signerIp,
      signerUserAgent: s.signerUserAgent,
      documentHashSha256: s.documentHashSha256,
      signatureDataUrl: s.signatureDataUrl,
      signedAt: s.signedAt?.toISOString() ?? null,
      expiresAt: s.expiresAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }
  }

  static productTemplateToResponse(t: any) {
    return {
      id: t.id,
      tenantId: t.tenantId,
      name: t.name,
      category: t.category,
      defaultSkuPrefix: t.defaultSkuPrefix,
      defaultUnitPrice: t.defaultUnitPrice,
      defaultCurrency: t.defaultCurrency,
      pricingType: t.pricingType,
      defaultTaxRate: t.defaultTaxRate,
      defaultDescription: t.defaultDescription,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }
  }
}
