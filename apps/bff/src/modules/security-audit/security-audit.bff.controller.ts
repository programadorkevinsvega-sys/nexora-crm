import { Controller, Get, Post, Param, Body, Query, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { SecurityAuditBffService } from './security-audit.bff.service'
import type {
  SecurityAccessLog,
  RecordAccessEventDto,
  SecurityAnomaly,
  ResolveAnomalyDto,
} from '@crm/contracts'

@ApiTags('Security Audit, Forensics & Anomaly Monitoring')
@Controller('api/security-audit')
export class SecurityAuditBffController {
  constructor(private readonly service: SecurityAuditBffService) {}

  @Get('logs')
  @ApiOperation({ summary: 'Consultar bitácora de accesos y sesiones activas' })
  async listAccessLogs(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Query('limit') limit = 50,
  ): Promise<SecurityAccessLog[]> {
    return this.service.listAccessLogs(tenantId, Number(limit) || 50)
  }

  @Post('events')
  @ApiOperation({ summary: 'Registrar evento de acceso o inicio de sesión' })
  async recordAccessEvent(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: RecordAccessEventDto,
  ): Promise<SecurityAccessLog> {
    return this.service.recordAccessEvent(tenantId, dto)
  }

  @Get('anomalies')
  @ApiOperation({ summary: 'Listar alertas de seguridad y anomalías de viaje imposible/fuerza bruta' })
  async listAnomalies(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<SecurityAnomaly[]> {
    return this.service.listAnomalies(tenantId)
  }

  @Post('anomalies/:id/resolve')
  @ApiOperation({ summary: 'Resolver y mitigar alerta de seguridad' })
  async resolveAnomaly(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('id') anomalyId: string,
    @Body() dto: ResolveAnomalyDto,
  ): Promise<SecurityAnomaly> {
    return this.service.resolveAnomaly(tenantId, anomalyId, dto)
  }
}
