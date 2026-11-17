import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateAuditLogHandler, ListAuditLogsHandler, GetAuditLogHandler,
  GetEntityAuditHandler, GetEntityAuditSummaryHandler,
  GetAuditStatsHandler, GetModuleStatsHandler,
} from '../../application/handlers'
import {
  CreateAuditLogCommand, ListAuditLogsQuery,
  GetEntityAuditQuery, GetEntityAuditSummaryQuery,
  GetAuditStatsQuery, GetModuleStatsQuery,
} from '../../application/handlers'
import { AuditMapper } from '../../infrastructure/audit.mapper'

@Controller()
export class AuditGrpcController {
  constructor(
    private readonly createAuditLogHandler: CreateAuditLogHandler,
    private readonly listAuditLogsHandler: ListAuditLogsHandler,
    private readonly getAuditLogHandler: GetAuditLogHandler,
    private readonly getEntityAuditHandler: GetEntityAuditHandler,
    private readonly getEntityAuditSummaryHandler: GetEntityAuditSummaryHandler,
    private readonly getAuditStatsHandler: GetAuditStatsHandler,
    private readonly getModuleStatsHandler: GetModuleStatsHandler,
  ) {}

  @GrpcMethod('AuditService', 'CreateAuditLog')
  async createAuditLog(data: any) {
    const result = await this.createAuditLogHandler.execute(
      new CreateAuditLogCommand(data.tenantId, data.entityType, data.entityId, data.action,
        data.fieldName, data.oldValue, data.newValue, data.changedByUserId, data.moduleName,
        data.correlationId, data.ipAddress, data.userAgent,
        data.metadataJson ? JSON.parse(data.metadataJson) : undefined))
    return { json: JSON.stringify(AuditMapper.toResponse(result)) }
  }

  @GrpcMethod('AuditService', 'ListAuditLogs')
  async listAuditLogs(data: any) {
    const result = await this.listAuditLogsHandler.execute(
      new ListAuditLogsQuery(data.tenantId, data.entityType, data.entityId, data.action,
        data.moduleName, data.userId, data.fromDate, data.toDate, data.cursor, data.limit))
    return { jsonItems: result.data.map(l => JSON.stringify(AuditMapper.toResponse(l))), nextCursor: result.nextCursor ?? '' }
  }

  @GrpcMethod('AuditService', 'GetAuditLog')
  async getAuditLog(data: { id: string }) {
    const result = await this.getAuditLogHandler.execute(data.id)
    return { json: JSON.stringify(AuditMapper.toResponse(result)) }
  }

  @GrpcMethod('AuditService', 'GetEntityAudit')
  async getEntityAudit(data: any) {
    const result = await this.getEntityAuditHandler.execute(new GetEntityAuditQuery(data.entityType, data.entityId, data.tenantId))
    return { jsonItems: result.map(l => JSON.stringify(AuditMapper.toResponse(l))) }
  }

  @GrpcMethod('AuditService', 'GetEntityAuditSummary')
  async getEntityAuditSummary(data: any) {
    const result = await this.getEntityAuditSummaryHandler.execute(new GetEntityAuditSummaryQuery(data.entityType, data.entityId, data.tenantId))
    return { json: JSON.stringify(AuditMapper.summaryToResponse(result)) }
  }

  @GrpcMethod('AuditService', 'GetAuditStats')
  async getAuditStats(data: any) {
    const result = await this.getAuditStatsHandler.execute(new GetAuditStatsQuery(data.tenantId, data.fromDate, data.toDate))
    return { json: JSON.stringify(AuditMapper.statsToResponse(result)) }
  }

  @GrpcMethod('AuditService', 'GetAuditModuleStats')
  async getAuditModuleStats(data: any) {
    const result = await this.getModuleStatsHandler.execute(new GetModuleStatsQuery(data.tenantId, data.fromDate, data.toDate))
    return { jsonItems: result.map(m => JSON.stringify(AuditMapper.moduleStatsToResponse(m))) }
  }
}
