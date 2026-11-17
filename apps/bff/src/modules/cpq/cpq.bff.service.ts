import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type {
  Product,
  ProductTemplate,
  CreateProduct,
  UpdateProduct,
  CreateProductTemplate,
  QuoteApproval,
  RequestQuoteApproval,
  DecideQuoteApproval,
  ESignature,
  CreateSignatureRequest,
  SubmitSignature,
} from '@crm/contracts'

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'cpq:'

@Injectable()
export class CpqBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async createProduct(dto: CreateProduct, tenantId: string): Promise<Product> {
    const res = await this.api.createProduct({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return res
  }

  async updateProduct(id: string, dto: UpdateProduct, tenantId: string): Promise<Product> {
    const res = await this.api.updateProduct({ tenantId, id, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return res
  }

  async deleteProduct(id: string, tenantId: string): Promise<void> {
    await this.api.deleteProduct(tenantId, id)
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }

  async listProducts(tenantId: string): Promise<Product[]> {
    const cacheKey = `${CACHE_KEY_PREFIX}products:${tenantId}`
    return this.cache.getOrSet<Product[]>(
      cacheKey,
      () => this.api.listProducts(tenantId),
      CACHE_TTL_MS,
    )
  }

  async getProduct(id: string, tenantId: string): Promise<Product> {
    return this.api.getProduct(tenantId, id)
  }

  async createProductTemplate(dto: CreateProductTemplate, tenantId: string): Promise<ProductTemplate> {
    const res = await this.api.createProductTemplate({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return res
  }

  async listProductTemplates(tenantId: string): Promise<ProductTemplate[]> {
    const cacheKey = `${CACHE_KEY_PREFIX}templates:${tenantId}`
    return this.cache.getOrSet<ProductTemplate[]>(
      cacheKey,
      () => this.api.listProductTemplates(tenantId),
      CACHE_TTL_MS,
    )
  }

  async deleteProductTemplate(id: string, tenantId: string): Promise<void> {
    await this.api.deleteProductTemplate(tenantId, id)
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }

  async requestQuoteApproval(
    dto: RequestQuoteApproval,
    userId: string,
    tenantId: string,
  ): Promise<{ id: string; status: string }> {
    return this.api.requestQuoteApproval({
      tenantId,
      quoteId: dto.quoteId,
      requestedDiscountPercent: dto.requestedDiscountPercent,
      requestedByUserId: userId,
    })
  }

  async decideQuoteApproval(
    approvalId: string,
    dto: DecideQuoteApproval,
    approverUserId: string,
    tenantId: string,
  ): Promise<QuoteApproval> {
    return this.api.decideQuoteApproval({
      tenantId,
      approvalId,
      approverUserId,
      status: dto.status,
      rejectionReason: dto.rejectionReason,
    })
  }

  async listPendingApprovals(tenantId: string): Promise<QuoteApproval[]> {
    return this.api.listPendingApprovals(tenantId)
  }

  async initiateSignature(
    dto: CreateSignatureRequest,
    tenantId: string,
  ): Promise<ESignature> {
    return this.api.initiateSignature({ tenantId, ...dto })
  }

  async verifySignatureOtp(token: string, otpCode: string): Promise<void> {
    return this.api.verifySignatureOtp(token, otpCode)
  }

  async submitSignature(dto: SubmitSignature): Promise<ESignature> {
    return this.api.submitSignature(dto)
  }

  async getSignatureByToken(token: string): Promise<ESignature> {
    return this.api.getSignatureByToken(token)
  }
}
