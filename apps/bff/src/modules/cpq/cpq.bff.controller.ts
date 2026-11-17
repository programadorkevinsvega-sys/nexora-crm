import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { CpqBffService } from './cpq.bff.service'
import {
  CreateProductSchema,
  UpdateProductSchema,
  CreateProductTemplateSchema,
  RequestQuoteApprovalSchema,
  DecideQuoteApprovalSchema,
  CreateSignatureRequestSchema,
  SubmitSignatureSchema,
} from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator'
import type {
  CreateProduct,
  UpdateProduct,
  CreateProductTemplate,
  RequestQuoteApproval,
  DecideQuoteApproval,
  CreateSignatureRequest,
  SubmitSignature,
  Product,
  ProductTemplate,
  QuoteApproval,
  ESignature,
} from '@crm/contracts'

@Controller('api/cpq')
export class CpqBffController {
  constructor(private readonly service: CpqBffService) {}

  @Post('products')
  async createProduct(
    @Body(createZodPipe(CreateProductSchema)) dto: CreateProduct,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Product> {
    return this.service.createProduct(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Put('products/:id')
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(UpdateProductSchema)) dto: UpdateProduct,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Product> {
    return this.service.updateProduct(id, dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Delete('products/:id')
  async deleteProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ success: boolean }> {
    await this.service.deleteProduct(id, tenantId || '00000000-0000-0000-0000-000000000001')
    return { success: true }
  }

  @Get('products')
  async listProducts(
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Product[]> {
    return this.service.listProducts(tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('products/:id')
  async getProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Product> {
    return this.service.getProduct(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('templates')
  async createProductTemplate(
    @Body(createZodPipe(CreateProductTemplateSchema)) dto: CreateProductTemplate,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<ProductTemplate> {
    return this.service.createProductTemplate(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('templates')
  async listProductTemplates(
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<ProductTemplate[]> {
    return this.service.listProductTemplates(tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Delete('templates/:id')
  async deleteProductTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ success: boolean }> {
    await this.service.deleteProductTemplate(id, tenantId || '00000000-0000-0000-0000-000000000001')
    return { success: true }
  }

  @Post('approvals/request')
  async requestApproval(
    @Body(createZodPipe(RequestQuoteApprovalSchema)) dto: RequestQuoteApproval,
    @CurrentUser() user?: AuthenticatedUser,
    @Headers('X-Tenant-Id') headerTenantId?: string,
  ): Promise<{ id: string; status: string }> {
    const tenantId = user?.tenantId || headerTenantId || '00000000-0000-0000-0000-000000000001'
    const userId = user?.userId || '00000000-0000-0000-0000-000000000001'
    return this.service.requestQuoteApproval(dto, userId, tenantId)
  }

  @Post('approvals/:id/decide')
  async decideApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(DecideQuoteApprovalSchema)) dto: DecideQuoteApproval,
    @CurrentUser() user?: AuthenticatedUser,
    @Headers('X-Tenant-Id') headerTenantId?: string,
  ): Promise<QuoteApproval> {
    const tenantId = user?.tenantId || headerTenantId || '00000000-0000-0000-0000-000000000001'
    const userId = user?.userId || '00000000-0000-0000-0000-000000000001'
    return this.service.decideQuoteApproval(id, dto, userId, tenantId)
  }

  @Get('approvals/pending')
  async listPendingApprovals(
    @CurrentUser() user?: AuthenticatedUser,
    @Headers('X-Tenant-Id') headerTenantId?: string,
  ): Promise<QuoteApproval[]> {
    const tenantId = user?.tenantId || headerTenantId || '00000000-0000-0000-0000-000000000001'
    return this.service.listPendingApprovals(tenantId)
  }

  @Post('signatures/initiate')
  async initiateSignature(
    @Body(createZodPipe(CreateSignatureRequestSchema)) dto: CreateSignatureRequest,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<ESignature> {
    return this.service.initiateSignature(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('signatures/:token/verify-otp')
  async verifySignatureOtp(
    @Param('token') token: string,
    @Body() body: { otpCode: string },
  ): Promise<{ success: boolean }> {
    await this.service.verifySignatureOtp(token, body.otpCode)
    return { success: true }
  }

  @Post('signatures/submit')
  async submitSignature(
    @Body(createZodPipe(SubmitSignatureSchema)) dto: SubmitSignature,
  ): Promise<ESignature> {
    return this.service.submitSignature(dto)
  }

  @Get('signatures/:token')
  async getSignatureByToken(
    @Param('token') token: string,
  ): Promise<ESignature> {
    return this.service.getSignatureByToken(token)
  }
}
