import { Controller, Get, Post, Query, Body, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { DeduplicationBffService } from './deduplication.bff.service'
import type {
  DeduplicationRule,
  CreateDeduplicationRuleDto,
  DuplicateGroup,
  MergeRecordsDto,
  DeduplicationAuditLog,
  DeduplicationEntityType,
} from '@crm/contracts'

@ApiTags('Data Quality & Deduplication Engine')
@Controller('api/deduplication')
export class DeduplicationBffController {
  constructor(private readonly service: DeduplicationBffService) {}

  @Get('rules')
  @ApiOperation({ summary: 'Listar reglas de deduplicación activas' })
  async listRules(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<DeduplicationRule[]> {
    return this.service.listRules(tenantId)
  }

  @Post('rules')
  @ApiOperation({ summary: 'Crear una regla de deduplicación' })
  async createRule(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CreateDeduplicationRuleDto,
  ): Promise<DeduplicationRule> {
    return this.service.createRule(tenantId, dto)
  }

  @Get('scan')
  @ApiOperation({ summary: 'Escanear duplicados en contactos o empresas en tiempo real' })
  async scanDuplicates(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Query('entityType') entityType: DeduplicationEntityType = 'CONTACT',
  ): Promise<DuplicateGroup[]> {
    return this.service.scanDuplicates(tenantId, entityType)
  }

  @Post('merge')
  @ApiOperation({ summary: 'Fusionar registro duplicado en registro maestro' })
  async mergeRecords(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: MergeRecordsDto,
  ): Promise<DeduplicationAuditLog> {
    return this.service.mergeRecords(tenantId, dto)
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Consultar bitácora forense de fusiones de registros' })
  async listAuditLogs(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<DeduplicationAuditLog[]> {
    return this.service.listAuditLogs(tenantId)
  }
}
