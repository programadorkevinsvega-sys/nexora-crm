import { Controller, Get, Post, Body, Headers, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { PaymentsBffService } from './payments.bff.service'
import { Public } from '../../common/decorators/public.decorator'
import type { CreatePaymentLinkDto, PaymentTransaction } from '@crm/contracts'

@ApiTags('Payments & Invoicing')
@Controller('payments')
export class PaymentsBffController {
  constructor(private readonly service: PaymentsBffService) {}

  @Post('links')
  @ApiOperation({ summary: 'Generar enlace de pago para Cotización o Contrato' })
  async createPaymentLink(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CreatePaymentLinkDto,
  ): Promise<PaymentTransaction> {
    return this.service.createPaymentLink(tenantId, dto)
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Listar transacciones de pago asociadas a un recurso' })
  async listTransactions(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Query('resourceType') resourceType?: string,
    @Query('resourceId') resourceId?: string,
  ): Promise<PaymentTransaction[]> {
    return this.service.listTransactions(tenantId, resourceType, resourceId)
  }

  @Public()
  @Post('webhook/stripe')
  @ApiOperation({ summary: 'Recepción de webhooks de confirmación de pago de Stripe' })
  async handleStripeWebhook(@Body() event: Record<string, unknown>): Promise<{ received: boolean }> {
    return this.service.handleStripeWebhook(event)
  }
}