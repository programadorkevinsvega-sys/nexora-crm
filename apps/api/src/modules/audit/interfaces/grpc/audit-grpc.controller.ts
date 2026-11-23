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

interface CreateAuditLogRequest {
  tenantId?: string
  entityType: string
  entityId: string
  action: string
  fieldName?: string
  oldValue?: string
  newValue?: string
  changedByUserId?: string
  moduleName?: string
  correlationId?: string
  ipAddress?: string
  userAgent?: string
  metadataJson?: string
}
interface ListAuditLogsRequest {
  tenantId?: string
  entityType?: string
  entityId?: string
  action?: string
  moduleName?: string
  userId?: string
  fromDate?: string
  toDate?: string
  cursor?: string
  limit?: number
}
interface EntityAuditRequest {
  entityType: string
  entityId: string
  tenantId?: string
}
interface AuditStatsRequest {
  tenantId?: string
  fromDate?: string
  toDate?: string
}

function parseMetadata(json: string | undefined): Record<string, unknown> | undefined {
  if (!json) return undefined
  const parsed: unknown = JSON.parse(json)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new TypeError('Audit metadata must be a JSON object')
  }
  return parsed as Record<string, unknown>
}

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
  async createAuditLog(data: CreateAuditLogRequest) {
    const result = await this.createAuditLogHandler.execute(new CreateAuditLogCommand(
      data.tenantId, data.entityType, data.entityId, data.action,
      data.fieldName, data.oldValue, data.newValue, data.changedByUserId,
      data.moduleName, data.correlationId, data.ipAddress, data.userAgent,
      parseMetadata(data.metadataJson),
    ))
    return { json: JSON.stringify(AuditMapper.toResponse(result)) }
  }

  @GrpcMethod('AuditService', 'ListAuditLogs')
  async listAuditLogs(data: ListAuditLogsRequest) {
    const result = await this.listAuditLogsHandler.execute(new ListAuditLogsQuery(
      data.tenantId, data.entityType, data.entityId, data.action,
      data.moduleName, data.userId, data.fromDate, data.toDate, data.cursor, data.limit,
    ))
    return {
      jsonItems: result.data.map((log) => JSON.stringify(AuditMapper.toResponse(log))),
      nextCursor: result.nextCursor ?? '',
    }
  }

  @GrpcMethod('AuditService', 'GetAuditLog')
  async getAuditLog(data: { id: string }) {
    const result = await this.getAuditLogHandler.execute(data.id)
    return { json: JSON.stringify(AuditMapper.toResponse(result)) }
  }

  @GrpcMethod('AuditService', 'GetEntityAudit')
  async getEntityAudit(data: EntityAuditRequest) {
    const result = await this.getEntityAuditHandler.execute(
      new GetEntityAuditQuery(data.entityType, data.entityId, data.tenantId),
    )
    return { jsonItems: result.map((log) => JSON.stringify(AuditMapper.toResponse(log))) }
  }

  @GrpcMethod('AuditService', 'GetEntityAuditSummary')
  async getEntityAuditSummary(data: EntityAuditRequest) {
    const result = await this.getEntityAuditSummaryHandler.execute(
      new GetEntityAuditSummaryQuery(data.entityType, data.entityId, data.tenantId),
    )
    return { json: JSON.stringify(AuditMapper.summaryToResponse(result)) }
  }

  @GrpcMethod('AuditService', 'GetAuditStats')
  async getAuditStats(data: AuditStatsRequest) {
    const result = await this.getAuditStatsHandler.execute(new GetAuditStatsQuery(
      data.tenantId, data.fromDate, data.toDate,
    ))
    return { json: JSON.stringify(AuditMapper.statsToResponse(result)) }
  }

  @GrpcMethod('AuditService', 'GetAuditModuleStats')
  async getAuditModuleStats(data: AuditStatsRequest) {
    const result = await this.getModuleStatsHandler.execute(new GetModuleStatsQuery(
      data.tenantId, data.fromDate, data.toDate,
    ))
    return { jsonItems: result.map((moduleStats) => JSON.stringify(AuditMapper.moduleStatsToResponse(moduleStats))) }
  }
}
