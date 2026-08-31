import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateProductHandler,
  UpdateProductHandler,
  DeleteProductHandler,
  RequestQuoteApprovalHandler,
  DecideQuoteApprovalHandler,
  InitiateSignatureHandler,
  VerifySignatureOtpHandler,
  SubmitSignatureHandler,
} from '../../application/commands/cpq.handlers'
import {
  CreateProductTemplateHandler,
  DeleteProductTemplateHandler,
} from '../../application/commands/product-template.handlers'
import {
  GetProductHandler,
  ListProductsHandler,
  GetQuoteApprovalHandler,
  ListPendingApprovalsHandler,
  GetSignatureByTokenHandler,
} from '../../application/queries/cpq.handlers'
import { ListProductTemplatesHandler } from '../../application/queries/product-template.handlers'
import {
  CreateProductCommand,
  UpdateProductCommand,
  DeleteProductCommand,
  RequestQuoteApprovalCommand,
  DecideQuoteApprovalCommand,
  InitiateSignatureCommand,
  VerifySignatureOtpCommand,
  SubmitSignatureCommand,
} from '../../application/commands/cpq.commands'
import {
  CreateProductTemplateCommand,
  DeleteProductTemplateCommand,
} from '../../application/commands/product-template.commands'
import {
  GetProductQuery,
  ListProductsQuery,
  ListPendingApprovalsQuery,
  GetSignatureByTokenQuery,
} from '../../application/queries/cpq.queries'
import { ListProductTemplatesQuery } from '../../application/queries/product-template.queries'
import { CpqMapper } from '../../infrastructure/cpq.mapper'
import { ProductPricingType } from '@crm/contracts'

@Controller()
export class CpqGrpcController {
  constructor(
    private readonly createProductHandler: CreateProductHandler,
    private readonly updateProductHandler: UpdateProductHandler,
    private readonly deleteProductHandler: DeleteProductHandler,
    private readonly createTemplateHandler: CreateProductTemplateHandler,
    private readonly deleteTemplateHandler: DeleteProductTemplateHandler,
    private readonly listTemplatesHandler: ListProductTemplatesHandler,
    private readonly requestApprovalHandler: RequestQuoteApprovalHandler,
    private readonly decideApprovalHandler: DecideQuoteApprovalHandler,
    private readonly initiateSignatureHandler: InitiateSignatureHandler,
    private readonly verifyOtpHandler: VerifySignatureOtpHandler,
    private readonly submitSignatureHandler: SubmitSignatureHandler,
    private readonly getProductHandler: GetProductHandler,
    private readonly listProductsHandler: ListProductsHandler,
    private readonly listPendingApprovalsHandler: ListPendingApprovalsHandler,
    private readonly getSignatureByTokenHandler: GetSignatureByTokenHandler,
  ) {}

  @GrpcMethod('CpqService', 'CreateProduct')
  async createProduct(data: {
    tenantId: string
    sku: string
    name: string
    unitPrice: number
    description?: string
    currency?: string
    pricingType?: string
    taxRate?: number
  }) {
    const res = await this.createProductHandler.execute(
      new CreateProductCommand(
        data.tenantId,
        data.sku,
        data.name,
        data.unitPrice,
        data.description,
        data.currency,
        data.pricingType as ProductPricingType,
        data.taxRate,
      ),
    )
    const product = await this.getProductHandler.execute(
      new GetProductQuery(data.tenantId, res.id),
    )
    return { json: JSON.stringify(CpqMapper.productToResponse(product)) }
  }

  @GrpcMethod('CpqService', 'UpdateProduct')
  async updateProduct(data: {
    tenantId: string
    id: string
    name?: string
    unitPrice?: number
    description?: string
    currency?: string
    pricingType?: string
    taxRate?: number
    isActive?: boolean
  }) {
    const product = await this.updateProductHandler.execute(
      new UpdateProductCommand(
        data.tenantId,
        data.id,
        data.name,
        data.unitPrice,
        data.description,
        data.currency,
        data.pricingType as ProductPricingType,
        data.taxRate,
        data.isActive,
      ),
    )
    return { json: JSON.stringify(CpqMapper.productToResponse(product)) }
  }

  @GrpcMethod('CpqService', 'DeleteProduct')
  async deleteProduct(data: { tenantId: string; id: string }) {
    await this.deleteProductHandler.execute(
      new DeleteProductCommand(data.tenantId, data.id),
    )
    return {}
  }

  @GrpcMethod('CpqService', 'GetProduct')
  async getProduct(data: { tenantId: string; id: string }) {
    const product = await this.getProductHandler.execute(
      new GetProductQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(CpqMapper.productToResponse(product)) }
  }

  @GrpcMethod('CpqService', 'ListProducts')
  async listProducts(data: { tenantId: string }) {
    const products = await this.listProductsHandler.execute(
      new ListProductsQuery(data.tenantId, false),
    )
    return {
      jsonItems: products.map((p) => JSON.stringify(CpqMapper.productToResponse(p))),
    }
  }

  @GrpcMethod('CpqService', 'CreateProductTemplate')
  async createProductTemplate(data: {
    tenantId: string
    name: string
    category?: string
    defaultSkuPrefix?: string
    defaultUnitPrice: number
    defaultCurrency?: string
    pricingType?: string
    defaultTaxRate?: number
    defaultDescription?: string
  }) {
    const template = await this.createTemplateHandler.execute(
      new CreateProductTemplateCommand(
        data.tenantId,
        data.name,
        data.defaultUnitPrice,
        data.category,
        data.defaultSkuPrefix,
        data.defaultCurrency,
        data.pricingType as ProductPricingType,
        data.defaultTaxRate,
        data.defaultDescription,
      ),
    )
    return { json: JSON.stringify(CpqMapper.productTemplateToResponse(template)) }
  }

  @GrpcMethod('CpqService', 'ListProductTemplates')
  async listProductTemplates(data: { tenantId: string }) {
    const templates = await this.listTemplatesHandler.execute(
      new ListProductTemplatesQuery(data.tenantId),
    )
    return {
      jsonItems: templates.map((t) => JSON.stringify(CpqMapper.productTemplateToResponse(t))),
    }
  }

  @GrpcMethod('CpqService', 'DeleteProductTemplate')
  async deleteProductTemplate(data: { tenantId: string; id: string }) {
    await this.deleteTemplateHandler.execute(
      new DeleteProductTemplateCommand(data.tenantId, data.id),
    )
    return {}
  }

  @GrpcMethod('CpqService', 'RequestQuoteApproval')
  async requestQuoteApproval(data: {
    tenantId: string
    quoteId: string
    requestedDiscountPercent: number
    requestedByUserId: string
  }) {
    const res = await this.requestApprovalHandler.execute(
      new RequestQuoteApprovalCommand(
        data.tenantId,
        data.quoteId,
        data.requestedDiscountPercent,
        data.requestedByUserId,
      ),
    )
    return { json: JSON.stringify({ id: res.id, status: 'PENDING' }) }
  }

  @GrpcMethod('CpqService', 'DecideQuoteApproval')
  async decideQuoteApproval(data: {
    tenantId: string
    approvalId: string
    approverUserId: string
    status: 'APPROVED' | 'REJECTED'
    rejectionReason?: string
  }) {
    const approval = await this.decideApprovalHandler.execute(
      new DecideQuoteApprovalCommand(
        data.tenantId,
        data.approvalId,
        data.approverUserId,
        data.status,
        data.rejectionReason,
      ),
    )
    return { json: JSON.stringify(CpqMapper.approvalToResponse(approval)) }
  }

  @GrpcMethod('CpqService', 'ListPendingApprovals')
  async listPendingApprovals(data: { tenantId: string }) {
    const approvals = await this.listPendingApprovalsHandler.execute(
      new ListPendingApprovalsQuery(data.tenantId),
    )
    return {
      jsonItems: approvals.map((a) => JSON.stringify(CpqMapper.approvalToResponse(a))),
    }
  }

  @GrpcMethod('CpqService', 'InitiateSignature')
  async initiateSignature(data: {
    tenantId: string
    documentId: string
    signerName: string
    signerEmail: string
    documentType?: 'QUOTE' | 'CONTRACT'
    signerPhone?: string
    expiresInDays?: number
  }) {
    const signature = await this.initiateSignatureHandler.execute(
      new InitiateSignatureCommand(
        data.tenantId,
        data.documentId,
        data.signerName,
        data.signerEmail,
        data.documentType,
        data.signerPhone,
        data.expiresInDays,
      ),
    )
    return { json: JSON.stringify(CpqMapper.signatureToResponse(signature)) }
  }

  @GrpcMethod('CpqService', 'VerifySignatureOtp')
  async verifySignatureOtp(data: { token: string; otpCode: string }) {
    await this.verifyOtpHandler.execute(
      new VerifySignatureOtpCommand(data.token, data.otpCode),
    )
    return {}
  }

  @GrpcMethod('CpqService', 'SubmitSignature')
  async submitSignature(data: {
    token: string
    signatureDataUrl: string
    signerIp?: string
    signerUserAgent?: string
    documentHashSha256?: string
  }) {
    const signed = await this.submitSignatureHandler.execute(
      new SubmitSignatureCommand(
        data.token,
        data.signatureDataUrl,
        data.signerIp,
        data.signerUserAgent,
        data.documentHashSha256,
      ),
    )
    return { json: JSON.stringify(CpqMapper.signatureToResponse(signed)) }
  }

  @GrpcMethod('CpqService', 'GetSignatureByToken')
  async getSignatureByToken(data: { token: string }) {
    const signature = await this.getSignatureByTokenHandler.execute(
      new GetSignatureByTokenQuery(data.token),
    )
    return { json: JSON.stringify(CpqMapper.signatureToResponse(signature)) }
  }
}
