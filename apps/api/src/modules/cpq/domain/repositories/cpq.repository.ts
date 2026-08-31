import { Product } from '../entities/product.entity'
import { QuoteApproval } from '../entities/quote-approval.entity'
import { ESignature } from '../entities/e-signature.entity'

export abstract class ProductRepository {
  abstract save(product: Product): Promise<void>
  abstract findById(tenantId: string, id: string): Promise<Product | null>
  abstract findBySku(tenantId: string, sku: string): Promise<Product | null>
  abstract list(tenantId: string, activeOnly?: boolean): Promise<Product[]>
  abstract delete(tenantId: string, id: string): Promise<void>
}

export abstract class QuoteApprovalRepository {
  abstract save(approval: QuoteApproval): Promise<void>
  abstract findById(tenantId: string, id: string): Promise<QuoteApproval | null>
  abstract findByQuoteId(tenantId: string, quoteId: string): Promise<QuoteApproval[]>
  abstract listPending(tenantId: string): Promise<QuoteApproval[]>
}

export abstract class ESignatureRepository {
  abstract save(signature: ESignature): Promise<void>
  abstract findById(tenantId: string, id: string): Promise<ESignature | null>
  abstract findByToken(token: string): Promise<ESignature | null>
  abstract findByDocumentId(tenantId: string, documentId: string): Promise<ESignature[]>
}
