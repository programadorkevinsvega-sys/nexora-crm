import { Controller, Get, Query, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery, ApiHeader } from '@nestjs/swagger'
import { AuditBffService, AuditFilters } from './audit.bff.service'

@ApiTags('Auditoría Inmutable (Audit Logs)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/audit')
export class AuditBffController {
  constructor(private readonly service: AuditBffService) {}

  @Get('logs')
  @ApiOperation({ summary: 'Listar registros inmutables de auditoría y cambios' })
  @ApiQuery({ name: 'entityType', required: false, description: 'Contact, Deal, Quote, Contract, ApiKey' })
  @ApiQuery({ name: 'action', required: false, description: 'CREATE, UPDATE, DELETE, SIGN, APPROVE' })
  @ApiQuery({ name: 'moduleName', required: false, description: 'contacts, deals, quotes, contracts, developer' })
  async list(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('moduleName') moduleName?: string,
    @Query('userId') userId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ) {
    const filters: AuditFilters = {
      entityType,
      entityId,
      action,
      moduleName,
      userId,
      cursor,
      limit: limit ? Number(limit) : 25,
    }
    return this.service.list(filters, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas agregadas de cambios por módulo y entidad' })
  async getStats(@Headers('X-Tenant-Id') tenantId?: string) {
    return this.service.getStats(tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
