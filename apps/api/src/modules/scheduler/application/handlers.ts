import { Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { SchedulerRepository } from '../domain/repositories/scheduler.repository'
import { ScheduledTask, TaskExecution, Reminder, SlaConfig, SlaViolation } from '../domain/entities/scheduler.entity'
import { OutboxService } from '../../../common/outbox/outbox.service'
import { NatsService } from '../../../common/nats/nats.service'
import { TaskCreatedEvent, TaskUpdatedEvent, TaskDeletedEvent, TaskExecutedEvent, ReminderCreatedEvent, SlaViolationDetectedEvent } from '../domain/events/scheduler.events'

export class CreateTaskCommand {
  constructor(readonly tenantId: string | undefined, readonly name: string, readonly description: string | undefined, readonly cronExpression: string, readonly taskType: string, readonly targetService: string | undefined, readonly targetEndpoint: string | undefined, readonly targetPayload: Record<string, unknown> | undefined, readonly enabled: boolean | undefined, readonly maxRetries: number | undefined, readonly timeoutSeconds: number | undefined, readonly createdByUserId: string | undefined) {}
}
export class UpdateTaskCommand {
  constructor(readonly id: string, readonly tenantId: string | undefined, readonly name: string | undefined, readonly description: string | undefined, readonly cronExpression: string | undefined, readonly targetService: string | undefined, readonly targetEndpoint: string | undefined, readonly targetPayload: Record<string, unknown> | undefined, readonly enabled: boolean | undefined, readonly maxRetries: number | undefined, readonly timeoutSeconds: number | undefined) {}
}
export class ExecuteTaskCommand { constructor(readonly id: string, readonly tenantId: string | undefined) {} }

@Injectable()
export class CreateTaskHandler {
  constructor(private readonly repo: SchedulerRepository, private readonly outbox: OutboxService) {}
  async execute(cmd: CreateTaskCommand): Promise<ScheduledTask> {
    const task = ScheduledTask.create({ tenantId: cmd.tenantId, name: cmd.name, description: cmd.description, cronExpression: cmd.cronExpression, taskType: cmd.taskType, targetService: cmd.targetService, targetEndpoint: cmd.targetEndpoint, targetPayload: cmd.targetPayload, enabled: cmd.enabled, maxRetries: cmd.maxRetries, timeoutSeconds: cmd.timeoutSeconds, createdByUserId: cmd.createdByUserId })
    await this.repo.saveTask(task)
    await this.outbox.publish(new TaskCreatedEvent(task.id, task.tenantId, task.name, task.taskType, task.cronExpression))
    return task
  }
}
@Injectable()
export class UpdateTaskHandler {
  constructor(private readonly repo: SchedulerRepository, private readonly outbox: OutboxService) {}
  async execute(cmd: UpdateTaskCommand): Promise<ScheduledTask> {
    const existing = await this.repo.findTaskById(cmd.id); if (!existing) throw new NotFoundException('Task not found')
    const updated = new ScheduledTask(existing.id, existing.tenantId, cmd.name ?? existing.name, cmd.description ?? existing.description, cmd.cronExpression ?? existing.cronExpression, existing.taskType, cmd.targetService ?? existing.targetService, cmd.targetEndpoint ?? existing.targetEndpoint, cmd.targetPayload ?? existing.targetPayload, cmd.enabled ?? existing.enabled, cmd.maxRetries ?? existing.maxRetries, cmd.timeoutSeconds ?? existing.timeoutSeconds, existing.createdByUserId, existing.lastRunAt, existing.nextRunAt, existing.createdAt, new Date())
    await this.repo.updateTask(updated)
    await this.outbox.publish(new TaskUpdatedEvent(updated.id, updated.tenantId, updated.name, updated.enabled))
    return updated
  }
}
@Injectable()
export class DeleteTaskHandler {
  constructor(private readonly repo: SchedulerRepository, private readonly outbox: OutboxService) {}
  async execute(id: string): Promise<void> { const task = await this.repo.findTaskById(id); if (!task) return; await this.repo.updateTask(new ScheduledTask(task.id, task.tenantId, task.name, task.description, task.cronExpression, task.taskType, task.targetService, task.targetEndpoint, task.targetPayload, false, task.maxRetries, task.timeoutSeconds, task.createdByUserId, task.lastRunAt, task.nextRunAt, task.createdAt, new Date())); await this.outbox.publish(new TaskDeletedEvent(task.id, task.tenantId, task.name)) }
}
@Injectable()
export class ExecuteTaskHandler {
  constructor(private readonly repo: SchedulerRepository, private readonly nats: NatsService, private readonly outbox: OutboxService) {}
  async execute(cmd: ExecuteTaskCommand): Promise<TaskExecution> {
    const task = await this.repo.findTaskById(cmd.id); if (!task) throw new NotFoundException('Task not found')
    const exec = new TaskExecution(randomUUID(), task.id, task.tenantId, 'running', new Date(), null, null, null, 1)
    await this.repo.saveExecution(exec)
    try {
      if (task.targetEndpoint || task.targetService) {
        await this.nats.publish(`scheduler.execute.${task.taskType}`, { taskId: task.id, executionId: exec.id, tenantId: task.tenantId, targetEndpoint: task.targetEndpoint, payload: task.targetPayload ?? {} })
      }
      const done = new TaskExecution(exec.id, exec.taskId, exec.tenantId, 'completed', exec.startedAt, new Date(), { status: 'published' }, null, 1)
      await this.repo.saveExecution(done)
      const updated = new ScheduledTask(task.id, task.tenantId, task.name, task.description, task.cronExpression, task.taskType, task.targetService, task.targetEndpoint, task.targetPayload, task.enabled, task.maxRetries, task.timeoutSeconds, task.createdByUserId, new Date(), null, task.createdAt, new Date())
      await this.repo.updateTask(updated)
      await this.outbox.publish(new TaskExecutedEvent(done.id, done.taskId, done.tenantId, 'completed'))
      return done
    } catch (error: any) {
      const failed = new TaskExecution(exec.id, exec.taskId, exec.tenantId, 'failed', exec.startedAt, new Date(), null, error.message, 1)
      await this.repo.saveExecution(failed)
      await this.outbox.publish(new TaskExecutedEvent(failed.id, failed.taskId, failed.tenantId, 'failed'))
      return failed
    }
  }
}
@Injectable()
export class ListTasksHandler { constructor(private readonly repo: SchedulerRepository) {} async execute(q: any) { return this.repo.listTasks(q) } }
@Injectable()
export class GetTaskHandler { constructor(private readonly repo: SchedulerRepository) {} async execute(id: string) { const t = await this.repo.findTaskById(id); if (!t) throw new NotFoundException('Task not found'); return t } }
@Injectable()
export class ListExecutionsHandler { constructor(private readonly repo: SchedulerRepository) {} async execute(q: any) { return this.repo.listExecutions(q) } }
@Injectable()
export class CreateReminderHandler {
  constructor(private readonly repo: SchedulerRepository, private readonly outbox: OutboxService) {}
  async execute(cmd: { tenantId?: string; userId: string; title: string; description?: string; entityType?: string; entityId?: string; remindAt: Date; repeatInterval?: string; repeatCount?: number }): Promise<Reminder> {
    const rem = Reminder.create(cmd); await this.repo.saveReminder(rem)
    await this.outbox.publish(new ReminderCreatedEvent(rem.id, rem.userId, rem.title, rem.remindAt)); return rem
  }
}
@Injectable()
export class UpdateReminderHandler {
  constructor(private readonly repo: SchedulerRepository) {}
  async execute(cmd: { id: string; tenantId?: string; title?: string; description?: string; remindAt?: string; reminded?: boolean }): Promise<Reminder> {
    const existing = await this.repo.findReminderById(cmd.id); if (!existing) throw new NotFoundException('Reminder not found')
    const updated = new Reminder(existing.id, existing.tenantId, existing.userId, cmd.title ?? existing.title, cmd.description ?? existing.description, existing.entityType, existing.entityId, cmd.remindAt ? new Date(cmd.remindAt) : existing.remindAt, cmd.reminded ?? existing.reminded, existing.notified, existing.repeatInterval, existing.repeatCount, existing.repeatRemaining, existing.createdAt, new Date())
    await this.repo.updateReminder(updated); return updated
  }
}
@Injectable()
export class DeleteReminderHandler { constructor(private readonly repo: SchedulerRepository) {} async execute(id: string): Promise<void> { const r = await this.repo.findReminderById(id); if (!r) return; if (r.repeatRemaining && r.repeatRemaining > 1) { const updated = new Reminder(r.id, r.tenantId, r.userId, r.title, r.description, r.entityType, r.entityId, r.remindAt, true, r.notified, r.repeatInterval, r.repeatCount, r.repeatRemaining! - 1, r.createdAt, new Date()); await this.repo.updateReminder(updated) } else { await this.repo.updateReminder(new Reminder(r.id, r.tenantId, r.userId, r.title, r.description, r.entityType, r.entityId, r.remindAt, true, r.notified, r.repeatInterval, r.repeatCount, 0, r.createdAt, new Date())) } } }
@Injectable()
export class ListRemindersHandler { constructor(private readonly repo: SchedulerRepository) {} async execute(q: any) { return this.repo.listReminders(q) } }
@Injectable()
export class GetReminderHandler { constructor(private readonly repo: SchedulerRepository) {} async execute(id: string) { const r = await this.repo.findReminderById(id); if (!r) throw new NotFoundException('Reminder not found'); return r } }
@Injectable()
export class CreateSlaConfigHandler {
  constructor(private readonly repo: SchedulerRepository) {}
  async execute(cmd: { tenantId: string; name: string; entityType: string; conditionField?: string; conditionOperator?: string; conditionValue?: string; responseTimeMinutes: number; resolutionTimeMinutes?: number; escalationUserId?: string; escalationEmail?: string; enabled?: boolean }): Promise<SlaConfig> {
    const config = SlaConfig.create(cmd); await this.repo.saveSlaConfig(config); return config
  }
}
@Injectable()
export class UpdateSlaConfigHandler {
  constructor(private readonly repo: SchedulerRepository) {}
  async execute(cmd: { id: string; tenantId?: string; name?: string; responseTimeMinutes?: number; resolutionTimeMinutes?: number; escalationUserId?: string; escalationEmail?: string; enabled?: boolean }): Promise<SlaConfig> {
    const existing = await this.repo.findSlaConfigById(cmd.id); if (!existing) throw new NotFoundException('SLA config not found')
    const updated = new SlaConfig(existing.id, existing.tenantId, cmd.name ?? existing.name, existing.entityType, existing.conditionField, existing.conditionOperator, existing.conditionValue, cmd.responseTimeMinutes ?? existing.responseTimeMinutes, cmd.resolutionTimeMinutes ?? existing.resolutionTimeMinutes, cmd.escalationUserId ?? existing.escalationUserId, cmd.escalationEmail ?? existing.escalationEmail, cmd.enabled ?? existing.enabled, existing.createdAt, new Date())
    await this.repo.updateSlaConfig(updated); return updated
  }
}
@Injectable()
export class DeleteSlaConfigHandler {
  constructor(private readonly repo: SchedulerRepository) {}
  async execute(id: string): Promise<void> { const c = await this.repo.findSlaConfigById(id); if (!c) return; await this.repo.updateSlaConfig(new SlaConfig(c.id, c.tenantId, c.name, c.entityType, c.conditionField, c.conditionOperator, c.conditionValue, c.responseTimeMinutes, c.resolutionTimeMinutes, c.escalationUserId, c.escalationEmail, false, c.createdAt, new Date())) }
}
@Injectable()
export class ListSlaConfigsHandler { constructor(private readonly repo: SchedulerRepository) {} async execute(q: any) { return this.repo.listSlaConfigs(q) } }
@Injectable()
export class CheckSlaViolationsHandler {
  constructor(private readonly repo: SchedulerRepository, private readonly outbox: OutboxService) {}
  async execute(params: { tenantId?: string; entityType?: string }): Promise<SlaViolation[]> {
    const configs = params.tenantId ? await this.repo.listSlaConfigs({ tenantId: params.tenantId, entityType: params.entityType, enabled: true }) : []
    const violations: SlaViolation[] = []
    for (const config of configs) {
      const open = await this.repo.countOpenViolations(config.id, '')
      if (open === 0) {
        const v = new SlaViolation(randomUUID(), config.id, config.tenantId, config.entityType, 'check', 'response_breach', new Date(), null, null, null, 'open', null)
        await this.repo.saveSlaViolation(v); violations.push(v)
        await this.outbox.publish(new SlaViolationDetectedEvent(v.id, v.slaConfigId, v.tenantId, v.entityType, v.entityId))
      }
    }
    return violations
  }
}
@Injectable()
export class ListSlaViolationsHandler { constructor(private readonly repo: SchedulerRepository) {} async execute(q: any) { return this.repo.listSlaViolations(q) } }
@Injectable()
export class ResolveSlaViolationHandler {
  constructor(private readonly repo: SchedulerRepository) {}
  async execute(cmd: { id: string; tenantId?: string; notes?: string }): Promise<SlaViolation> {
    await this.repo.updateSlaViolation(cmd.id, { status: 'resolved', resolvedAt: new Date(), notes: cmd.notes })
    const rows = (await this.repo.listSlaViolations({ slaConfigId: undefined, cursor: undefined })).data
    const found = rows.find(r => r.id === cmd.id)
    if (!found) throw new NotFoundException('Violation not found')
    return found
  }
}
@Injectable()
export class ProcessDueTasksHandler {
  constructor(private readonly repo: SchedulerRepository, private readonly executeHandler: ExecuteTaskHandler) {}
  async execute(): Promise<TaskExecution[]> { const tasks = await this.repo.findDueTasks(); return Promise.all(tasks.map(t => this.executeHandler.execute(new ExecuteTaskCommand(t.id, undefined)))) }
}
@Injectable()
export class ProcessDueRemindersHandler {
  constructor(private readonly repo: SchedulerRepository) {}
  async execute(): Promise<void> {
    const due = await this.repo.findDueReminders()
    for (const r of due) {
      await this.repo.updateReminder(new Reminder(r.id, r.tenantId, r.userId, r.title, r.description, r.entityType, r.entityId, r.remindAt, true, true, r.repeatInterval, r.repeatCount, r.repeatRemaining, r.createdAt, new Date()))
    }
  }
}
