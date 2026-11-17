import { ScheduledTask, TaskExecution, Reminder, SlaConfig, SlaViolation } from '../entities/scheduler.entity'

export abstract class SchedulerRepository {
  abstract saveTask(task: ScheduledTask): Promise<void>
  abstract updateTask(task: ScheduledTask): Promise<void>
  abstract findTaskById(id: string): Promise<ScheduledTask | null>
  abstract listTasks(params: { tenantId?: string; enabled?: boolean; taskType?: string; cursor?: string; limit?: number }): Promise<{ data: ScheduledTask[]; nextCursor: string | null }>
  abstract findDueTasks(): Promise<ScheduledTask[]>
  abstract saveExecution(exec: TaskExecution): Promise<void>
  abstract listExecutions(params: { taskId: string; tenantId?: string; status?: string; cursor?: string; limit?: number }): Promise<{ data: TaskExecution[]; nextCursor: string | null }>
  abstract saveReminder(r: Reminder): Promise<void>
  abstract updateReminder(r: Reminder): Promise<void>
  abstract findReminderById(id: string): Promise<Reminder | null>
  abstract listReminders(params: { tenantId?: string; userId?: string; entityType?: string; entityId?: string; pendingOnly?: boolean; cursor?: string; limit?: number }): Promise<{ data: Reminder[]; nextCursor: string | null }>
  abstract findDueReminders(): Promise<Reminder[]>
  abstract saveSlaConfig(config: SlaConfig): Promise<void>
  abstract updateSlaConfig(config: SlaConfig): Promise<void>
  abstract findSlaConfigById(id: string): Promise<SlaConfig | null>
  abstract listSlaConfigs(params: { tenantId: string; entityType?: string; enabled?: boolean }): Promise<SlaConfig[]>
  abstract saveSlaViolation(v: SlaViolation): Promise<void>
  abstract listSlaViolations(params: { tenantId?: string; slaConfigId?: string; entityType?: string; status?: string; cursor?: string; limit?: number }): Promise<{ data: SlaViolation[]; nextCursor: string | null }>
  abstract updateSlaViolation(id: string, data: Partial<{ status: string; respondedAt: Date; resolvedAt: Date; escalatedAt: Date; notes: string }>): Promise<void>
  abstract countOpenViolations(slaConfigId: string, entityId: string): Promise<number>
}
