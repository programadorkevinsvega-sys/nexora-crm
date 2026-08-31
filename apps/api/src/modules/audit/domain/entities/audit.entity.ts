import { randomUUID } from 'crypto'

export class AuditLog {
  constructor(
    readonly id: string, readonly tenantId: string | null,
    readonly entityType: string, readonly entityId: string,
    readonly action: string, readonly fieldName: string | null,
    readonly oldValue: string | null, readonly newValue: string | null,
    readonly changedByUserId: string | null, readonly moduleName: string | null,
    readonly correlationId: string | null, readonly ipAddress: string | null,
    readonly userAgent: string | null,
    readonly metadataJson: Record<string, unknown> | null,
    readonly createdAt: Date,
  ) {}
  static create(props: {
    tenantId?: string; entityType: string; entityId: string; action: string
    fieldName?: string; oldValue?: string; newValue?: string; changedByUserId?: string
    moduleName?: string; correlationId?: string; ipAddress?: string
    userAgent?: string; metadata?: Record<string, unknown>
  }): AuditLog {
    return new AuditLog(randomUUID(), props.tenantId ?? null, props.entityType,
      props.entityId, props.action, props.fieldName ?? null, props.oldValue ?? null,
      props.newValue ?? null, props.changedByUserId ?? null, props.moduleName ?? null,
      props.correlationId ?? null, props.ipAddress ?? null, props.userAgent ?? null,
      props.metadata ?? null, new Date())
  }
}

export interface AuditStats {
  totalLogs: number
  byAction: Record<string, number>
  byModule: Record<string, number>
  byEntity: Record<string, number>
  periodStart: string
  periodEnd: string
}

export interface EntityAuditSummary {
  entityType: string
  entityId: string
  totalChanges: number
  lastChangeAt: string | null
  lastChangeBy: string | null
  changesByField: Record<string, { count: number; lastValue: string | null }>
}

export interface ModuleStats {
  moduleName: string
  totalLogs: number
  lastActivity: string | null
  actions: Record<string, number>
}
