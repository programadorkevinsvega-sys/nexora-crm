import { Controller, Get, Query, Headers } from '@nestjs/common'
import { AuditBffService, AuditFilters } from './audit.bff.service'

@Controller('api/audit')
export class AuditBffController {
  constructor(private readonly service: AuditBffService) {}

  @Get('logs')
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
  async getStats(@Headers('X-Tenant-Id') tenantId?: string) {
    return this.service.getStats(tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
