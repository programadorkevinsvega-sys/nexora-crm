import { Controller, Post, Param, Body, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { EnrichmentBffService } from './enrichment.bff.service'
import type {
  EmailValidationResult,
  ContactEnrichmentResult,
  CompanyEnrichmentResult,
} from '@crm/contracts'

@ApiTags('Data Enrichment & Intelligence')
@Controller('enrichment')
export class EnrichmentBffController {
  constructor(private readonly service: EnrichmentBffService) {}

  @Post('email/validate')
  @ApiOperation({ summary: 'Validar entregabilidad, registros MX y desechabilidad de email' })
  async validateEmail(@Body('email') email: string): Promise<EmailValidationResult> {
    return this.service.validateEmail(email)
  }

  @Post('contact/:id')
  @ApiOperation({ summary: 'Enriquecer contacto con datos profesionales de LinkedIn' })
  async enrichContact(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('id') contactId: string,
  ): Promise<ContactEnrichmentResult> {
    return this.service.enrichContact(tenantId, contactId)
  }

  @Post('company/:id')
  @ApiOperation({ summary: 'Enriquecer empresa con LinkedIn Company Page, empleados y tecnologías' })
  async enrichCompany(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('id') companyId: string,
  ): Promise<CompanyEnrichmentResult> {
    return this.service.enrichCompany(tenantId, companyId)
  }
}
