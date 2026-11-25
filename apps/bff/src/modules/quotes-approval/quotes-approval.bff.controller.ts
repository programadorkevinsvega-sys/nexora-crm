import { Controller, Get, Post, Param, Body, Headers, Ip } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { QuotesApprovalBffService } from './quotes-approval.bff.service'
import type {
  DiscountApprovalRule,
  CreateDiscountApprovalRuleDto,
  QuoteApprovalRequest,
  RequestQuoteApprovalDto,
  CustomerQuoteAcceptance,
  SubmitCustomerQuoteAcceptanceDto,
} from '@crm/contracts'

@ApiTags('Discount Matrix & Customer Quote Acceptance Portal')
@Controller('api/quotes-approval')
export class QuotesApprovalBffController {
  constructor(private readonly service: QuotesApprovalBffService) {}

  @Get('rules')
  @ApiOperation({ summary: 'Listar reglas de aprobación de descuentos' })
  async listRules(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<DiscountApprovalRule[]> {
    return this.service.listRules(tenantId)
  }

  @Post('rules')
  @ApiOperation({ summary: 'Crear regla de aprobación de descuentos' })
  async createRule(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CreateDiscountApprovalRuleDto,
  ): Promise<DiscountApprovalRule> {
    return this.service.createRule(tenantId, dto)
  }

  @Get('requests')
  @ApiOperation({ summary: 'Listar solicitudes de aprobación de descuentos pendientes' })
  async listApprovalRequests(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<QuoteApprovalRequest[]> {
    return this.service.listApprovalRequests(tenantId)
  }

  @Post('request')
  @ApiOperation({ summary: 'Solicitar aprobación de descuento para una cotización' })
  async requestApproval(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: RequestQuoteApprovalDto,
  ): Promise<QuoteApprovalRequest> {
    return this.service.requestApproval(tenantId, dto)
  }

  @Post('requests/:id/review')
  @ApiOperation({ summary: 'Aprobar o rechazar descuento de cotización' })
  async reviewApproval(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('id') requestId: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED'; notes?: string },
  ): Promise<QuoteApprovalRequest> {
    return this.service.reviewApproval(tenantId, requestId, body.status, undefined, body.notes)
  }

  @Post('quotes/:id/token')
  @ApiOperation({ summary: 'Generar token público de autoservicio para cotización' })
  async generateCustomerToken(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('id') quoteId: string,
  ): Promise<CustomerQuoteAcceptance> {
    return this.service.generateCustomerToken(tenantId, quoteId)
  }

  @Get('public/:token')
  @ApiOperation({ summary: 'Consultar estado público de aceptación de cotización' })
  async getCustomerQuoteAcceptance(@Param('token') token: string): Promise<CustomerQuoteAcceptance> {
    return this.service.getCustomerQuoteAcceptance(token)
  }

  @Post('public/:token/accept')
  @ApiOperation({ summary: 'Firmar y aceptar/rechazar digitalmente cotización por el cliente final' })
  async submitCustomerAcceptance(
    @Param('token') token: string,
    @Body() dto: SubmitCustomerQuoteAcceptanceDto,
    @Ip() ipAddress: string,
  ): Promise<CustomerQuoteAcceptance> {
    return this.service.submitCustomerAcceptance(token, dto, ipAddress)
  }
}
