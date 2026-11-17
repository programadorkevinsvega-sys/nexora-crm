import { ScheduledTask, TaskExecution, Reminder, SlaConfig, SlaViolation } from '../domain/entities/scheduler.entity'

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
  static taskToDomain(r: any): ScheduledTask {
    return new ScheduledTask(r.id, r.tenantId, r.name, r.description, r.cronExpression,
      r.taskType, r.targetService, r.targetEndpoint, r.targetPayload, r.enabled,
      r.maxRetries, r.timeoutSeconds, r.createdByUserId, r.lastRunAt, r.nextRunAt,
      r.createdAt, r.updatedAt)
  }
  static executionToDomain(r: any): TaskExecution {
    return new TaskExecution(r.id, r.taskId, r.tenantId, r.status, r.startedAt,
      r.finishedAt, r.resultPayload, r.errorMessage, r.attemptNumber)
  }
  static reminderToDomain(r: any): Reminder {
    return new Reminder(r.id, r.tenantId, r.userId, r.title, r.description,
      r.entityType, r.entityId, r.remindAt, r.reminded, r.notified,
      r.repeatInterval, r.repeatCount, r.repeatRemaining, r.createdAt, r.updatedAt)
  }
  static slaConfigToDomain(r: any): SlaConfig {
    return new SlaConfig(r.id, r.tenantId, r.name, r.entityType, r.conditionField,
      r.conditionOperator, r.conditionValue, r.responseTimeMinutes, r.resolutionTimeMinutes,
      r.escalationUserId, r.escalationEmail, r.enabled, r.createdAt, r.updatedAt)
  }
  static violationToDomain(r: any): SlaViolation {
    return new SlaViolation(r.id, r.slaConfigId, r.tenantId, r.entityType, r.entityId,
      r.violationType, r.detectedAt, r.respondedAt, r.resolvedAt, r.escalatedAt,
      r.status, r.notes)
  }
}
