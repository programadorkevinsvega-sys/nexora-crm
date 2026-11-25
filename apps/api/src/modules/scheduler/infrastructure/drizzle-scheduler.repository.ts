import { Injectable } from '@nestjs/common'
import { eq, and, gt, asc, desc, lte, ne, type SQL } from 'drizzle-orm'
import { getDb, scheduledTasks, taskExecutions, reminders, slaConfigs, slaViolations } from '@crm/database'
import { SchedulerRepository } from '../domain/repositories/scheduler.repository'
import { ScheduledTask, TaskExecution, Reminder, SlaConfig, SlaViolation } from '../domain/entities/scheduler.entity'
import { SchedulerMapper } from './scheduler.mapper'

@Injectable()
export class DrizzleSchedulerRepository extends SchedulerRepository {
  private get db() { return getDb() }

  async saveTask(task: ScheduledTask): Promise<void> {
    await this.db.insert(scheduledTasks).values({
      id: task.id, tenantId: task.tenantId, name: task.name, description: task.description,
      cronExpression: task.cronExpression, taskType: task.taskType,
      targetService: task.targetService, targetEndpoint: task.targetEndpoint,
      targetPayload: task.targetPayload, enabled: task.enabled, maxRetries: task.maxRetries,
      timeoutSeconds: task.timeoutSeconds, createdByUserId: task.createdByUserId,
      lastRunAt: task.lastRunAt, nextRunAt: task.nextRunAt,
      createdAt: task.createdAt, updatedAt: task.updatedAt,
    }).onConflictDoNothing()
  }

  async updateTask(task: ScheduledTask): Promise<void> {
    await this.db.update(scheduledTasks).set({
      name: task.name, description: task.description, cronExpression: task.cronExpression,
      targetService: task.targetService, targetEndpoint: task.targetEndpoint,
      targetPayload: task.targetPayload, enabled: task.enabled, maxRetries: task.maxRetries,
      timeoutSeconds: task.timeoutSeconds, lastRunAt: task.lastRunAt,
      nextRunAt: task.nextRunAt, updatedAt: new Date(),
    }).where(eq(scheduledTasks.id, task.id))
  }

  async findTaskById(id: string): Promise<ScheduledTask | null> {
    const row = await this.db.query.scheduledTasks.findFirst({ where: eq(scheduledTasks.id, id) })
    return row ? SchedulerMapper.taskToDomain(row) : null
  }

  async listTasks(params: { tenantId?: string; enabled?: boolean; taskType?: string; cursor?: string; limit?: number }): Promise<{ data: ScheduledTask[]; nextCursor: string | null }> {
    const conditions: SQL[] = []
    if (params.tenantId) conditions.push(eq(scheduledTasks.tenantId, params.tenantId))
    if (params.enabled !== undefined) conditions.push(eq(scheduledTasks.enabled, params.enabled))
    if (params.taskType) conditions.push(eq(scheduledTasks.taskType, params.taskType))
    if (params.cursor) conditions.push(gt(scheduledTasks.createdAt, new Date(params.cursor)))
    const limit = params.limit ?? 20
    const rows = await this.db.query.scheduledTasks.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      limit: limit + 1, orderBy: [asc(scheduledTasks.createdAt)],
    })
    const hasMore = rows.length > limit
    return { data: (hasMore ? rows.slice(0, limit) : rows).map(r => SchedulerMapper.taskToDomain(r)), nextCursor: hasMore ? rows[limit - 1].createdAt.toISOString() : null }
  }

  async findDueTasks(): Promise<ScheduledTask[]> {
    const rows = await this.db.query.scheduledTasks.findMany({
      where: and(eq(scheduledTasks.enabled, true), lte(scheduledTasks.nextRunAt, new Date())),
    })
    return rows.map(r => SchedulerMapper.taskToDomain(r))
  }

  async saveExecution(exec: TaskExecution): Promise<void> {
    await this.db.insert(taskExecutions).values({
      id: exec.id, taskId: exec.taskId, tenantId: exec.tenantId, status: exec.status,
      startedAt: exec.startedAt, finishedAt: exec.finishedAt,
      resultPayload: exec.resultPayload, errorMessage: exec.errorMessage,
      attemptNumber: exec.attemptNumber,
    }).onConflictDoNothing()
  }

  async listExecutions(params: { taskId: string; tenantId?: string; status?: string; cursor?: string; limit?: number }): Promise<{ data: TaskExecution[]; nextCursor: string | null }> {
    const conditions: SQL[] = [eq(taskExecutions.taskId, params.taskId)]
    if (params.tenantId) conditions.push(eq(taskExecutions.tenantId, params.tenantId))
    if (params.status) conditions.push(eq(taskExecutions.status, params.status))
    if (params.cursor) conditions.push(gt(taskExecutions.startedAt, new Date(params.cursor)))
    const limit = params.limit ?? 20
    const rows = await this.db.query.taskExecutions.findMany({
      where: and(...conditions), limit: limit + 1, orderBy: [desc(taskExecutions.startedAt)],
    })
    const hasMore = rows.length > limit
    return { data: (hasMore ? rows.slice(0, limit) : rows).map(r => SchedulerMapper.executionToDomain(r)), nextCursor: hasMore ? rows[limit - 1].startedAt.toISOString() : null }
  }

  async saveReminder(r: Reminder): Promise<void> {
    await this.db.insert(reminders).values({
      id: r.id, tenantId: r.tenantId, userId: r.userId, title: r.title,
      description: r.description, entityType: r.entityType, entityId: r.entityId,
      remindAt: r.remindAt, reminded: r.reminded, notified: r.notified,
      repeatInterval: r.repeatInterval, repeatCount: r.repeatCount,
      repeatRemaining: r.repeatRemaining, createdAt: r.createdAt, updatedAt: r.updatedAt,
    }).onConflictDoNothing()
  }

  async updateReminder(r: Reminder): Promise<void> {
    await this.db.update(reminders).set({
      title: r.title, description: r.description, remindAt: r.remindAt,
      reminded: r.reminded, notified: r.notified,
      repeatRemaining: r.repeatRemaining, updatedAt: new Date(),
    }).where(eq(reminders.id, r.id))
  }

  async findReminderById(id: string): Promise<Reminder | null> {
    const row = await this.db.query.reminders.findFirst({ where: eq(reminders.id, id) })
    return row ? SchedulerMapper.reminderToDomain(row) : null
  }

  async listReminders(params: { tenantId?: string; userId?: string; entityType?: string; entityId?: string; pendingOnly?: boolean; cursor?: string; limit?: number }): Promise<{ data: Reminder[]; nextCursor: string | null }> {
    const conditions: SQL[] = []
    if (params.tenantId) conditions.push(eq(reminders.tenantId, params.tenantId))
    if (params.userId) conditions.push(eq(reminders.userId, params.userId))
    if (params.entityType) conditions.push(eq(reminders.entityType, params.entityType))
    if (params.entityId) conditions.push(eq(reminders.entityId, params.entityId))
    if (params.pendingOnly) conditions.push(eq(reminders.reminded, false))
    if (params.cursor) conditions.push(gt(reminders.createdAt, new Date(params.cursor)))
    const limit = params.limit ?? 20
    const rows = await this.db.query.reminders.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      limit: limit + 1, orderBy: [asc(reminders.remindAt)],
    })
    const hasMore = rows.length > limit
    return { data: (hasMore ? rows.slice(0, limit) : rows).map(r => SchedulerMapper.reminderToDomain(r)), nextCursor: hasMore ? rows[limit - 1].createdAt.toISOString() : null }
  }

  async findDueReminders(): Promise<Reminder[]> {
    const rows = await this.db.query.reminders.findMany({
      where: and(eq(reminders.reminded, false), lte(reminders.remindAt, new Date())),
    })
    return rows.map(r => SchedulerMapper.reminderToDomain(r))
  }

  async saveSlaConfig(config: SlaConfig): Promise<void> {
    await this.db.insert(slaConfigs).values({
      id: config.id, tenantId: config.tenantId, name: config.name, entityType: config.entityType,
      conditionField: config.conditionField, conditionOperator: config.conditionOperator,
      conditionValue: config.conditionValue, responseTimeMinutes: config.responseTimeMinutes,
      resolutionTimeMinutes: config.resolutionTimeMinutes,
      escalationUserId: config.escalationUserId, escalationEmail: config.escalationEmail,
      enabled: config.enabled, createdAt: config.createdAt, updatedAt: config.updatedAt,
    }).onConflictDoNothing()
  }

  async updateSlaConfig(config: SlaConfig): Promise<void> {
    await this.db.update(slaConfigs).set({
      name: config.name, responseTimeMinutes: config.responseTimeMinutes,
      resolutionTimeMinutes: config.resolutionTimeMinutes,
      escalationUserId: config.escalationUserId, escalationEmail: config.escalationEmail,
      enabled: config.enabled, updatedAt: new Date(),
    }).where(eq(slaConfigs.id, config.id))
  }

  async findSlaConfigById(id: string): Promise<SlaConfig | null> {
    const row = await this.db.query.slaConfigs.findFirst({ where: eq(slaConfigs.id, id) })
    return row ? SchedulerMapper.slaConfigToDomain(row) : null
  }

  async listSlaConfigs(params: { tenantId: string; entityType?: string; enabled?: boolean }): Promise<SlaConfig[]> {
    const conditions: SQL[] = [eq(slaConfigs.tenantId, params.tenantId)]
    if (params.entityType) conditions.push(eq(slaConfigs.entityType, params.entityType))
    if (params.enabled !== undefined) conditions.push(eq(slaConfigs.enabled, params.enabled))
    const rows = await this.db.query.slaConfigs.findMany({ where: and(...conditions) })
    return rows.map(r => SchedulerMapper.slaConfigToDomain(r))
  }

  async saveSlaViolation(v: SlaViolation): Promise<void> {
    await this.db.insert(slaViolations).values({
      id: v.id, slaConfigId: v.slaConfigId, tenantId: v.tenantId, entityType: v.entityType,
      entityId: v.entityId, violationType: v.violationType, detectedAt: v.detectedAt,
      respondedAt: v.respondedAt, resolvedAt: v.resolvedAt, escalatedAt: v.escalatedAt,
      status: v.status, notes: v.notes,
    }).onConflictDoNothing()
  }

  async listSlaViolations(params: { tenantId?: string; slaConfigId?: string; entityType?: string; status?: string; cursor?: string; limit?: number }): Promise<{ data: SlaViolation[]; nextCursor: string | null }> {
    const conditions: SQL[] = []
    if (params.tenantId) conditions.push(eq(slaViolations.tenantId, params.tenantId))
    if (params.slaConfigId) conditions.push(eq(slaViolations.slaConfigId, params.slaConfigId))
    if (params.entityType) conditions.push(eq(slaViolations.entityType, params.entityType))
    if (params.status) conditions.push(eq(slaViolations.status, params.status))
    if (params.cursor) conditions.push(gt(slaViolations.detectedAt, new Date(params.cursor)))
    const limit = params.limit ?? 20
    const rows = await this.db.query.slaViolations.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      limit: limit + 1, orderBy: [desc(slaViolations.detectedAt)],
    })
    const hasMore = rows.length > limit
    return { data: (hasMore ? rows.slice(0, limit) : rows).map(r => SchedulerMapper.violationToDomain(r)), nextCursor: hasMore ? rows[limit - 1].detectedAt.toISOString() : null }
  }

  async updateSlaViolation(id: string, data: Partial<{ status: string; respondedAt: Date; resolvedAt: Date; escalatedAt: Date; notes: string }>): Promise<void> {
    await this.db.update(slaViolations).set(data).where(eq(slaViolations.id, id))
  }

  async countOpenViolations(slaConfigId: string, entityId: string): Promise<number> {
    const rows = await this.db.query.slaViolations.findMany({
      where: and(eq(slaViolations.slaConfigId, slaConfigId), eq(slaViolations.entityId, entityId), ne(slaViolations.status, 'resolved')),
    })
    return rows.length
  }
}
