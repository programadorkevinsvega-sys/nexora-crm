import { Injectable } from '@nestjs/common'
import {
  GetProductQuery,
  ListProductsQuery,
  GetQuoteApprovalQuery,
  ListPendingApprovalsQuery,
  GetSignatureByTokenQuery,
} from './cpq.queries'
import {
  ProductRepository,
  QuoteApprovalRepository,
  ESignatureRepository,
} from '../../domain/repositories/cpq.repository'
import { Product } from '../../domain/entities/product.entity'
import { QuoteApproval } from '../../domain/entities/quote-approval.entity'
import { ESignature } from '../../domain/entities/e-signature.entity'
import { NotFoundError } from '@crm/shared'

@Injectable()
export class GetProductHandler {
  constructor(private readonly repo: ProductRepository) {}

  async execute(query: GetProductQuery): Promise<Product> {
    const product = await this.repo.findById(query.tenantId, query.id)
    if (!product) throw new NotFoundError('Product', query.id)
    return product
  }
}

@Injectable()
export class ListProductsHandler {
  constructor(private readonly repo: ProductRepository) {}

  async execute(query: ListProductsQuery): Promise<Product[]> {
    return this.repo.list(query.tenantId, query.activeOnly)
  }
}

@Injectable()
export class GetQuoteApprovalHandler {
  constructor(private readonly repo: QuoteApprovalRepository) {}

  async execute(query: GetQuoteApprovalQuery): Promise<QuoteApproval> {
    const approval = await this.repo.findById(query.tenantId, query.id)
    if (!approval) throw new NotFoundError('QuoteApproval', query.id)
    return approval
  }
}

@Injectable()
export class ListPendingApprovalsHandler {
  constructor(private readonly repo: QuoteApprovalRepository) {}

  async execute(query: ListPendingApprovalsQuery): Promise<QuoteApproval[]> {
    return this.repo.listPending(query.tenantId)
  }
}

@Injectable()
export class GetSignatureByTokenHandler {
  constructor(private readonly repo: ESignatureRepository) {}

  async execute(query: GetSignatureByTokenQuery): Promise<ESignature> {
    const signature = await this.repo.findByToken(query.token)
    if (!signature) throw new NotFoundError('ESignature', query.token)
    return signature
  }
}
