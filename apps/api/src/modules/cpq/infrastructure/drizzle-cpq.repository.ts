import { Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { getDb, products as productsTable, quoteApprovals as approvalsTable, eSignatures as signaturesTable } from '@crm/database'
import { ProductRepository, QuoteApprovalRepository, ESignatureRepository } from '../domain/repositories/cpq.repository'
import { Product } from '../domain/entities/product.entity'
import { QuoteApproval } from '../domain/entities/quote-approval.entity'
import { ESignature } from '../domain/entities/e-signature.entity'
import { CpqMapper } from './cpq.mapper'

@Injectable()
export class DrizzleProductRepository extends ProductRepository {
  private get db() {
    return getDb()
  }

  async save(product: Product): Promise<void> {
    const existing = await this.findById(product.tenantId, product.id)
    if (existing) {
      await this.db
        .update(productsTable)
        .set({
          sku: product.sku,
          name: product.name,
          description: product.description,
          unitPrice: String(product.unitPrice),
          currency: product.currency,
          pricingType: product.pricingType,
          taxRate: String(product.taxRate),
          isActive: product.isActive,
          updatedAt: product.updatedAt,
        })
        .where(and(eq(productsTable.tenantId, product.tenantId), eq(productsTable.id, product.id)))
    } else {
      await this.db.insert(productsTable).values({
        id: product.id,
        tenantId: product.tenantId,
        sku: product.sku,
        name: product.name,
        description: product.description,
        unitPrice: String(product.unitPrice),
        currency: product.currency,
        pricingType: product.pricingType,
        taxRate: String(product.taxRate),
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })
    }
  }

  async findById(tenantId: string, id: string): Promise<Product | null> {
    const rows = await this.db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.tenantId, tenantId), eq(productsTable.id, id)))
      .limit(1)

    return rows.length > 0 ? CpqMapper.productToDomain(rows[0]) : null
  }

  async findBySku(tenantId: string, sku: string): Promise<Product | null> {
    const rows = await this.db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.tenantId, tenantId), eq(productsTable.sku, sku)))
      .limit(1)

    return rows.length > 0 ? CpqMapper.productToDomain(rows[0]) : null
  }

  async list(tenantId: string, activeOnly = false): Promise<Product[]> {
    const conditions = [eq(productsTable.tenantId, tenantId)]
    if (activeOnly) {
      conditions.push(eq(productsTable.isActive, true))
    }

    const rows = await this.db
      .select()
      .from(productsTable)
      .where(and(...conditions))

    return rows.map(CpqMapper.productToDomain)
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db
      .delete(productsTable)
      .where(and(eq(productsTable.tenantId, tenantId), eq(productsTable.id, id)))
  }
}

@Injectable()
export class DrizzleQuoteApprovalRepository extends QuoteApprovalRepository {
  private get db() {
    return getDb()
  }

  async save(approval: QuoteApproval): Promise<void> {
    const existing = await this.findById(approval.tenantId, approval.id)
    if (existing) {
      await this.db
        .update(approvalsTable)
        .set({
          status: approval.status,
          approverUserId: approval.approverUserId,
          rejectionReason: approval.rejectionReason,
          decidedAt: approval.decidedAt,
          updatedAt: approval.updatedAt,
        })
        .where(and(eq(approvalsTable.tenantId, approval.tenantId), eq(approvalsTable.id, approval.id)))
    } else {
      await this.db.insert(approvalsTable).values({
        id: approval.id,
        tenantId: approval.tenantId,
        quoteId: approval.quoteId,
        requestedDiscountPercent: String(approval.requestedDiscountPercent),
        requestedByUserId: approval.requestedByUserId,
        approverUserId: approval.approverUserId,
        status: approval.status,
        rejectionReason: approval.rejectionReason,
        decidedAt: approval.decidedAt,
        createdAt: approval.createdAt,
        updatedAt: approval.updatedAt,
      })
    }
  }

  async findById(tenantId: string, id: string): Promise<QuoteApproval | null> {
    const rows = await this.db
      .select()
      .from(approvalsTable)
      .where(and(eq(approvalsTable.tenantId, tenantId), eq(approvalsTable.id, id)))
      .limit(1)

    return rows.length > 0 ? CpqMapper.quoteApprovalToDomain(rows[0]) : null
  }

  async findByQuoteId(tenantId: string, quoteId: string): Promise<QuoteApproval[]> {
    const rows = await this.db
      .select()
      .from(approvalsTable)
      .where(and(eq(approvalsTable.tenantId, tenantId), eq(approvalsTable.quoteId, quoteId)))

    return rows.map(CpqMapper.quoteApprovalToDomain)
  }

  async listPending(tenantId: string): Promise<QuoteApproval[]> {
    const rows = await this.db
      .select()
      .from(approvalsTable)
      .where(and(eq(approvalsTable.tenantId, tenantId), eq(approvalsTable.status, 'PENDING')))

    return rows.map(CpqMapper.quoteApprovalToDomain)
  }
}

@Injectable()
export class DrizzleESignatureRepository extends ESignatureRepository {
  private get db() {
    return getDb()
  }

  async save(sig: ESignature): Promise<void> {
    const existing = await this.findById(sig.tenantId, sig.id)
    if (existing) {
      await this.db
        .update(signaturesTable)
        .set({
          status: sig.status,
          signerIp: sig.signerIp,
          signerUserAgent: sig.signerUserAgent,
          documentHashSha256: sig.documentHashSha256,
          signatureDataUrl: sig.signatureDataUrl,
          signedAt: sig.signedAt,
          updatedAt: sig.updatedAt,
        })
        .where(and(eq(signaturesTable.tenantId, sig.tenantId), eq(signaturesTable.id, sig.id)))
    } else {
      await this.db.insert(signaturesTable).values({
        id: sig.id,
        tenantId: sig.tenantId,
        documentId: sig.documentId,
        documentType: sig.documentType,
        signerName: sig.signerName,
        signerEmail: sig.signerEmail,
        signerPhone: sig.signerPhone,
        token: sig.token,
        otpCode: sig.otpCode,
        status: sig.status,
        signerIp: sig.signerIp,
        signerUserAgent: sig.signerUserAgent,
        documentHashSha256: sig.documentHashSha256,
        signatureDataUrl: sig.signatureDataUrl,
        signedAt: sig.signedAt,
        expiresAt: sig.expiresAt,
        createdAt: sig.createdAt,
        updatedAt: sig.updatedAt,
      })
    }
  }

  async findById(tenantId: string, id: string): Promise<ESignature | null> {
    const rows = await this.db
      .select()
      .from(signaturesTable)
      .where(and(eq(signaturesTable.tenantId, tenantId), eq(signaturesTable.id, id)))
      .limit(1)

    return rows.length > 0 ? CpqMapper.signatureToDomain(rows[0]) : null
  }

  async findByToken(token: string): Promise<ESignature | null> {
    const rows = await this.db
      .select()
      .from(signaturesTable)
      .where(eq(signaturesTable.token, token))
      .limit(1)

    return rows.length > 0 ? CpqMapper.signatureToDomain(rows[0]) : null
  }

  async findByDocumentId(tenantId: string, documentId: string): Promise<ESignature[]> {
    const rows = await this.db
      .select()
      .from(signaturesTable)
      .where(and(eq(signaturesTable.tenantId, tenantId), eq(signaturesTable.documentId, documentId)))

    return rows.map(CpqMapper.signatureToDomain)
  }
}
