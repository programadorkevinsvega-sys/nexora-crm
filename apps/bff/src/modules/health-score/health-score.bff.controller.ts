import { Controller, Get, Post, Param, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { HealthScoreBffService } from './health-score.bff.service'
import type { CustomerHealthScore } from '@crm/contracts'

@ApiTags('Customer Health & Churn Prevention')
@Controller('health-score')
export class HealthScoreBffController {
  constructor(private readonly service: HealthScoreBffService) {}

  @Get('contact/:id')
  @ApiOperation({ summary: 'Obtener Customer Health Score 360° de un contacto' })
  async getContactHealthScore(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('id') contactId: string,
  ): Promise<CustomerHealthScore> {
    return this.service.getContactHealthScore(tenantId, contactId)
  }

  @Post('contact/:id/recalculate')
  @ApiOperation({ summary: 'Recalcular Health Score en tiempo real basado en interacciones' })
  async recalculateContactHealthScore(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('id') contactId: string,
  ): Promise<CustomerHealthScore> {
    return this.service.calculateContactHealthScore(tenantId, contactId)
  }

  @Get('at-risk')
  @ApiOperation({ summary: 'Listar clientes en riesgo o críticos para prevención de churn' })
  async listAtRiskCustomers(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<CustomerHealthScore[]> {
    return this.service.listAtRiskCustomers(tenantId)
  }
}
