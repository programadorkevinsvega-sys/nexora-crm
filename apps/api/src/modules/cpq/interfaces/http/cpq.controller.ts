import { Controller, Get, Post, Body, Param, Query, Headers } from '@nestjs/common'
import {
  CreateProductHandler,
  RequestQuoteApprovalHandler,
  DecideQuoteApprovalHandler,
  InitiateSignatureHandler,
  VerifySignatureOtpHandler,
  SubmitSignatureHandler,
} from '../../application/commands/cpq.handlers'
import {
  GetProductHandler,
  ListProductsHandler,
  ListPendingApprovalsHandler,
  GetSignatureByTokenHandler,
} from '../../application/queries/cpq.handlers'
import {
  CreateProductCommand,
  RequestQuoteApprovalCommand,
  DecideQuoteApprovalCommand,
  InitiateSignatureCommand,
  VerifySignatureOtpCommand,
  SubmitSignatureCommand,
} from '../../application/commands/cpq.commands'
import {
  GetProductQuery,
  ListProductsQuery,
  ListPendingApprovalsQuery,
  GetSignatureByTokenQuery,
} from '../../application/queries/cpq.queries'
import { CpqMapper } from '../../infrastructure/cpq.mapper'
import { ProductPricingType } from '@crm/contracts'

@Controller('cpq')
export class CpqController {
  constructor(
    private readonly createProductHandler: CreateProductHandler,
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

  @Post('products')
  async createProduct(
    @Body() dto: { sku: string; name: string; unitPrice: number; description?: string; currency?: string; pricingType?: ProductPricingType; taxRate?: number },
    @Headers('X-Tenant-Id') tenantId: string,
  ) {
    const res = await this.createProductHandler.execute(
      new CreateProductCommand(
        tenantId,
        dto.sku,
        dto.name,
        dto.unitPrice,
        dto.description,
        dto.currency,
        dto.pricingType,
        dto.taxRate,
      ),
    )
    const product = await this.getProductHandler.execute(
      new GetProductQuery(tenantId, res.id),
    )
    return CpqMapper.productToResponse(product)
  }

  @Get('products')
  async listProducts(
    @Headers('X-Tenant-Id') tenantId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const products = await this.listProductsHandler.execute(
      new ListProductsQuery(tenantId, activeOnly === 'true'),
    )
    return products.map(CpqMapper.productToResponse)
  }

  @Post('approvals/request')
  async requestApproval(
    @Body() dto: { quoteId: string; requestedDiscountPercent: number; requestedByUserId: string },
    @Headers('X-Tenant-Id') tenantId: string,
  ) {
    const res = await this.requestApprovalHandler.execute(
      new RequestQuoteApprovalCommand(
        tenantId,
        dto.quoteId,
        dto.requestedDiscountPercent,
        dto.requestedByUserId,
      ),
    )
    return { id: res.id, status: 'PENDING' }
  }

  @Post('approvals/:id/decide')
  async decideApproval(
    @Param('id') id: string,
    @Body() dto: { approverUserId: string; status: 'APPROVED' | 'REJECTED'; rejectionReason?: string },
    @Headers('X-Tenant-Id') tenantId: string,
  ) {
    const approval = await this.decideApprovalHandler.execute(
      new DecideQuoteApprovalCommand(
        tenantId,
        id,
        dto.approverUserId,
        dto.status,
        dto.rejectionReason,
      ),
    )
    return CpqMapper.approvalToResponse(approval)
  }

  @Get('approvals/pending')
  async listPendingApprovals(@Headers('X-Tenant-Id') tenantId: string) {
    const approvals = await this.listPendingApprovalsHandler.execute(
      new ListPendingApprovalsQuery(tenantId),
    )
    return approvals.map(CpqMapper.approvalToResponse)
  }

  @Post('signatures/initiate')
  async initiateSignature(
    @Body() dto: { documentId: string; signerName: string; signerEmail: string; documentType?: 'QUOTE' | 'CONTRACT'; signerPhone?: string; expiresInDays?: number },
    @Headers('X-Tenant-Id') tenantId: string,
  ) {
    const signature = await this.initiateSignatureHandler.execute(
      new InitiateSignatureCommand(
        tenantId,
        dto.documentId,
        dto.signerName,
        dto.signerEmail,
        dto.documentType,
        dto.signerPhone,
        dto.expiresInDays,
      ),
    )
    return CpqMapper.signatureToResponse(signature)
  }

  @Post('signatures/:token/verify-otp')
  async verifyOtp(
    @Param('token') token: string,
    @Body() dto: { otpCode: string },
  ) {
    await this.verifyOtpHandler.execute(
      new VerifySignatureOtpCommand(token, dto.otpCode),
    )
    return { success: true }
  }

  @Post('signatures/:token/submit')
  async submitSignature(
    @Param('token') token: string,
    @Body() dto: { signatureDataUrl: string; signerIp?: string; signerUserAgent?: string; documentHashSha256?: string },
  ) {
    const signed = await this.submitSignatureHandler.execute(
      new SubmitSignatureCommand(
        token,
        dto.signatureDataUrl,
        dto.signerIp,
        dto.signerUserAgent,
        dto.documentHashSha256,
      ),
    )
    return CpqMapper.signatureToResponse(signed)
  }

  @Get('signatures/:token')
  async getSignature(@Param('token') token: string) {
    const signature = await this.getSignatureByTokenHandler.execute(
      new GetSignatureByTokenQuery(token),
    )
    return CpqMapper.signatureToResponse(signature)
  }
}
