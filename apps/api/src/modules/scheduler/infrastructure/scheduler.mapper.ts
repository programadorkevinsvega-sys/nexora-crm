import { scheduledTasks, taskExecutions, reminders, slaConfigs, slaViolations } from '@crm/database'
import { ScheduledTask, TaskExecution, Reminder, SlaConfig, SlaViolation } from '../domain/entities/scheduler.entity'

function jsonObjectOrNull(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

export class SchedulerMapper {
  static taskToResponse(t: ScheduledTask) {
    return { id: t.id, tenantId: t.tenantId, name: t.name, description: t.description,
      cronExpression: t.cronExpression, taskType: t.taskType, targetService: t.targetService,
      targetEndpoint: t.targetEndpoint, targetPayload: t.targetPayload,
      enabled: t.enabled, maxRetries: t.maxRetries, timeoutSeconds: t.timeoutSeconds,
      createdByUserId: t.createdByUserId, lastRunAt: t.lastRunAt?.toISOString() ?? null,
      nextRunAt: t.nextRunAt?.toISOString() ?? null, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() }
  }
  static executionToResponse(e: TaskExecution) {
    return { id: e.id, taskId: e.taskId, tenantId: e.tenantId, status: e.status,
      startedAt: e.startedAt.toISOString(), finishedAt: e.finishedAt?.toISOString() ?? null,
      resultPayload: e.resultPayload, errorMessage: e.errorMessage, attemptNumber: e.attemptNumber }
  }
  static reminderToResponse(r: Reminder) {
    return { id: r.id, tenantId: r.tenantId, userId: r.userId, title: r.title,
      description: r.description, entityType: r.entityType, entityId: r.entityId,
      remindAt: r.remindAt.toISOString(), reminded: r.reminded, notified: r.notified,
      repeatInterval: r.repeatInterval, repeatCount: r.repeatCount,
      repeatRemaining: r.repeatRemaining, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() }
  }
  static slaConfigToResponse(c: SlaConfig) {
    return { id: c.id, tenantId: c.tenantId, name: c.name, entityType: c.entityType,
      conditionField: c.conditionField, conditionOperator: c.conditionOperator,
      conditionValue: c.conditionValue, responseTimeMinutes: c.responseTimeMinutes,
      resolutionTimeMinutes: c.resolutionTimeMinutes, escalationUserId: c.escalationUserId,
      escalationEmail: c.escalationEmail, enabled: c.enabled,
      createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() }
  }
  static violationToResponse(v: SlaViolation) {
    return { id: v.id, slaConfigId: v.slaConfigId, tenantId: v.tenantId,
      entityType: v.entityType, entityId: v.entityId, violationType: v.violationType,
      detectedAt: v.detectedAt.toISOString(), respondedAt: v.respondedAt?.toISOString() ?? null,
      resolvedAt: v.resolvedAt?.toISOString() ?? null, escalatedAt: v.escalatedAt?.toISOString() ?? null,
      status: v.status, notes: v.notes }
  }

  static taskToDomain(row: typeof scheduledTasks.$inferSelect): ScheduledTask {
    return new ScheduledTask(
      row.id, row.tenantId, row.name, row.description, row.cronExpression,
      row.taskType, row.targetService, row.targetEndpoint, jsonObjectOrNull(row.targetPayload),
      row.enabled, row.maxRetries, row.timeoutSeconds, row.createdByUserId,
      row.lastRunAt, row.nextRunAt, row.createdAt, row.updatedAt,
    )
  }

  static executionToDomain(row: typeof taskExecutions.$inferSelect): TaskExecution {
    return new TaskExecution(
      row.id, row.taskId, row.tenantId, row.status, row.startedAt, row.finishedAt,
      jsonObjectOrNull(row.resultPayload), row.errorMessage, row.attemptNumber,
    )
  }

  static reminderToDomain(row: typeof reminders.$inferSelect): Reminder {
    return new Reminder(
      row.id, row.tenantId, row.userId, row.title, row.description, row.entityType,
      row.entityId, row.remindAt, row.reminded, row.notified, row.repeatInterval,
      row.repeatCount, row.repeatRemaining, row.createdAt, row.updatedAt,
    )
  }

  static slaConfigToDomain(row: typeof slaConfigs.$inferSelect): SlaConfig {
    return new SlaConfig(
      row.id, row.tenantId, row.name, row.entityType, row.conditionField,
      row.conditionOperator, row.conditionValue, row.responseTimeMinutes,
      row.resolutionTimeMinutes, row.escalationUserId, row.escalationEmail,
      row.enabled, row.createdAt, row.updatedAt,
    )
  }

  static violationToDomain(row: typeof slaViolations.$inferSelect): SlaViolation {
    return new SlaViolation(
      row.id, row.slaConfigId, row.tenantId, row.entityType, row.entityId,
      row.violationType, row.detectedAt, row.respondedAt, row.resolvedAt,
      row.escalatedAt, row.status, row.notes,
    )
  }
}