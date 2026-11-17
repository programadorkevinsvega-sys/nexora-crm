import { Controller, Get, Post, Param, Body, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { SlaBffService } from './sla.bff.service'
import type {
  SlaPolicy,
  CreateSlaPolicyDto,
  SlaEscalationRule,
  CreateSlaEscalationRuleDto,
  TicketSlaTracker,
} from '@crm/contracts'

@ApiTags('Service Level Agreements (SLA) & Escalation Matrices')
@Controller('api/sla')
export class SlaBffController {
  constructor(private readonly service: SlaBffService) {}

  @Get('policies')
  @ApiOperation({ summary: 'Listar políticas de SLA configuradas' })
  async listPolicies(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<SlaPolicy[]> {
    return this.service.listPolicies(tenantId)
  }

  @Post('policies')
  @ApiOperation({ summary: 'Crear una nueva política de SLA' })
  async createPolicy(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CreateSlaPolicyDto,
  ): Promise<SlaPolicy> {
    return this.service.createPolicy(tenantId, dto)
  }

  @Get('policies/:id/rules')
  @ApiOperation({ summary: 'Listar reglas de escalación multinivel de un SLA' })
  async listEscalationRules(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('id') policyId: string,
  ): Promise<SlaEscalationRule[]> {
    return this.service.listEscalationRules(tenantId, policyId)
  }

  @Post('rules')
  @ApiOperation({ summary: 'Crear una regla de escalación automática' })
  async createEscalationRule(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CreateSlaEscalationRuleDto,
  ): Promise<SlaEscalationRule> {
    return this.service.createEscalationRule(tenantId, dto)
  }

  @Get('trackers')
  @ApiOperation({ summary: 'Consultar seguimiento y cumplimiento de SLAs en tickets' })
  async listTrackers(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<TicketSlaTracker[]> {
    return this.service.listTrackers(tenantId)
  }
}
