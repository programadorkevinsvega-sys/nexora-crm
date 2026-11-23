import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateTaskHandler, UpdateTaskHandler, DeleteTaskHandler, ExecuteTaskHandler,
  ListTasksHandler, GetTaskHandler, ListExecutionsHandler,
  CreateReminderHandler, UpdateReminderHandler, DeleteReminderHandler,
  ListRemindersHandler, GetReminderHandler,
  CreateSlaConfigHandler, UpdateSlaConfigHandler, DeleteSlaConfigHandler,
  ListSlaConfigsHandler, CheckSlaViolationsHandler, ListSlaViolationsHandler, ResolveSlaViolationHandler,
  CreateTaskCommand, UpdateTaskCommand, ExecuteTaskCommand,
} from '../../application/handlers'
import { SchedulerMapper } from '../../infrastructure/scheduler.mapper'
import type { ScheduledTask, TaskExecution, Reminder, SlaConfig, SlaViolation } from '../../domain/entities/scheduler.entity'
import type { SchedulerRepository } from '../../domain/repositories/scheduler.repository'

type JsonObject = Record<string, unknown>

interface CreateTaskRequest {
  tenantId?: string
  name: string
  description?: string
  cronExpression: string
  taskType: string
  targetService?: string
  targetEndpoint?: string
  targetPayloadJson?: string
  enabled?: boolean
  maxRetries?: number
  timeoutSeconds?: number
  createdByUserId?: string
}
interface UpdateTaskRequest {
  id: string
  tenantId?: string
  name?: string
  description?: string
  cronExpression?: string
  targetService?: string
  targetEndpoint?: string
  targetPayloadJson?: string
  enabled?: boolean
  maxRetries?: number
  timeoutSeconds?: number
}
interface EntityIdRequest { id: string; tenantId?: string }
type ListTasksRequest = Parameters<SchedulerRepository['listTasks']>[0]
type ListExecutionsRequest = Parameters<SchedulerRepository['listExecutions']>[0]
interface CreateReminderRequest {
  tenantId?: string
  userId: string
  title: string
  description?: string
  entityType?: string
  entityId?: string
  remindAt: string
  repeatInterval?: string
  repeatCount?: number
}
interface UpdateReminderRequest {
  id: string
  tenantId?: string
  title?: string
  description?: string
  remindAt?: string
  reminded?: boolean
}
type ListRemindersRequest = Parameters<SchedulerRepository['listReminders']>[0]
interface CreateSlaConfigRequest {
  tenantId: string
  name: string
  entityType: string
  conditionField?: string
  conditionOperator?: string
  conditionValue?: string
  responseTimeMinutes: number
  resolutionTimeMinutes?: number
  escalationUserId?: string
  escalationEmail?: string
  enabled?: boolean
}
interface UpdateSlaConfigRequest {
  id: string
  tenantId?: string
  name?: string
  responseTimeMinutes?: number
  resolutionTimeMinutes?: number
  escalationUserId?: string
  escalationEmail?: string
  enabled?: boolean
}
type ListSlaConfigsRequest = Parameters<SchedulerRepository['listSlaConfigs']>[0]
type ListSlaViolationsRequest = Parameters<SchedulerRepository['listSlaViolations']>[0]
interface CheckSlaViolationsRequest { tenantId?: string; entityType?: string }
interface ResolveSlaViolationRequest { id: string; tenantId?: string; notes?: string }

function parseJsonObject(json: string | undefined): JsonObject | undefined {
  if (!json) return undefined
  const parsed: unknown = JSON.parse(json)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new TypeError('Expected a JSON object')
  }
  return parsed as JsonObject
}

@Controller()
export class SchedulerGrpcController {
  constructor(
    private readonly createTask: CreateTaskHandler,
    private readonly updateTask: UpdateTaskHandler,
    private readonly deleteTask: DeleteTaskHandler,
    private readonly executeTask: ExecuteTaskHandler,
    private readonly listTasks: ListTasksHandler,
    private readonly getTask: GetTaskHandler,
    private readonly listExecutions: ListExecutionsHandler,
    private readonly createReminder: CreateReminderHandler,
    private readonly updateReminder: UpdateReminderHandler,
    private readonly deleteReminder: DeleteReminderHandler,
    private readonly listReminders: ListRemindersHandler,
    private readonly getReminder: GetReminderHandler,
    private readonly createSlaConfig: CreateSlaConfigHandler,
    private readonly updateSlaConfig: UpdateSlaConfigHandler,
    private readonly deleteSlaConfig: DeleteSlaConfigHandler,
    private readonly listSlaConfigs: ListSlaConfigsHandler,
    private readonly checkSlaViolations: CheckSlaViolationsHandler,
    private readonly listViolations: ListSlaViolationsHandler,
    private readonly resolveViolation: ResolveSlaViolationHandler,
  ) {}

  @GrpcMethod('SchedulerService', 'CreateTask')
  async createTaskHandler(data: CreateTaskRequest) {
    const result = await this.createTask.execute(new CreateTaskCommand(
      data.tenantId, data.name, data.description, data.cronExpression, data.taskType,
      data.targetService, data.targetEndpoint, parseJsonObject(data.targetPayloadJson),
      data.enabled, data.maxRetries, data.timeoutSeconds, data.createdByUserId,
    ))
    return { json: JSON.stringify(SchedulerMapper.taskToResponse(result)) }
  }

  @GrpcMethod('SchedulerService', 'UpdateTask')
  async updateTaskHandler(data: UpdateTaskRequest) {
    const result = await this.updateTask.execute(new UpdateTaskCommand(
      data.id, data.tenantId, data.name, data.description, data.cronExpression,
      data.targetService, data.targetEndpoint, parseJsonObject(data.targetPayloadJson),
      data.enabled, data.maxRetries, data.timeoutSeconds,
    ))
    return { json: JSON.stringify(SchedulerMapper.taskToResponse(result)) }
  }

  @GrpcMethod('SchedulerService', 'DeleteTask')
  async deleteTaskHandler(data: EntityIdRequest) {
    await this.deleteTask.execute(data.id)
    return { id: data.id }
  }

  @GrpcMethod('SchedulerService', 'ListTasks')
  async listTasksHandler(data: ListTasksRequest) {
    const result = await this.listTasks.execute(data)
    return {
      jsonItems: result.data.map((task: ScheduledTask) => JSON.stringify(SchedulerMapper.taskToResponse(task))),
      nextCursor: result.nextCursor ?? '',
    }
  }

  @GrpcMethod('SchedulerService', 'GetTask')
  async getTaskHandler(data: EntityIdRequest) {
    const result = await this.getTask.execute(data.id)
    return { json: JSON.stringify(SchedulerMapper.taskToResponse(result)) }
  }

  @GrpcMethod('SchedulerService', 'ExecuteTask')
  async executeTaskHandler(data: EntityIdRequest) {
    const result = await this.executeTask.execute(new ExecuteTaskCommand(data.id, data.tenantId))
    return { json: JSON.stringify(SchedulerMapper.executionToResponse(result)) }
  }

  @GrpcMethod('SchedulerService', 'ListTaskExecutions')
  async listExecutionsHandler(data: ListExecutionsRequest) {
    const result = await this.listExecutions.execute(data)
    return {
      jsonItems: result.data.map((execution: TaskExecution) => JSON.stringify(SchedulerMapper.executionToResponse(execution))),
      nextCursor: result.nextCursor ?? '',
    }
  }

  @GrpcMethod('SchedulerService', 'CreateReminder')
  async createReminderHandler(data: CreateReminderRequest) {
    const result = await this.createReminder.execute({
      tenantId: data.tenantId,
      userId: data.userId,
      title: data.title,
      description: data.description,
      entityType: data.entityType,
      entityId: data.entityId,
      remindAt: new Date(data.remindAt),
      repeatInterval: data.repeatInterval,
      repeatCount: data.repeatCount,
    })
    return { json: JSON.stringify(SchedulerMapper.reminderToResponse(result)) }
  }

  @GrpcMethod('SchedulerService', 'UpdateReminder')
  async updateReminderHandler(data: UpdateReminderRequest) {
    const result = await this.updateReminder.execute(data)
    return { json: JSON.stringify(SchedulerMapper.reminderToResponse(result)) }
  }

  @GrpcMethod('SchedulerService', 'DeleteReminder')
  async deleteReminderHandler(data: EntityIdRequest) {
    await this.deleteReminder.execute(data.id)
    return { id: data.id }
  }

  @GrpcMethod('SchedulerService', 'ListReminders')
  async listRemindersHandler(data: ListRemindersRequest) {
    const result = await this.listReminders.execute(data)
    return {
      jsonItems: result.data.map((reminder: Reminder) => JSON.stringify(SchedulerMapper.reminderToResponse(reminder))),
      nextCursor: result.nextCursor ?? '',
    }
  }

  @GrpcMethod('SchedulerService', 'GetReminder')
  async getReminderHandler(data: EntityIdRequest) {
    const result = await this.getReminder.execute(data.id)
    return { json: JSON.stringify(SchedulerMapper.reminderToResponse(result)) }
  }

  @GrpcMethod('SchedulerService', 'CreateSlaConfig')
  async createSlaConfigHandler(data: CreateSlaConfigRequest) {
    const result = await this.createSlaConfig.execute(data)
    return { json: JSON.stringify(SchedulerMapper.slaConfigToResponse(result)) }
  }

  @GrpcMethod('SchedulerService', 'UpdateSlaConfig')
  async updateSlaConfigHandler(data: UpdateSlaConfigRequest) {
    const result = await this.updateSlaConfig.execute(data)
    return { json: JSON.stringify(SchedulerMapper.slaConfigToResponse(result)) }
  }

  @GrpcMethod('SchedulerService', 'DeleteSlaConfig')
  async deleteSlaConfigHandler(data: EntityIdRequest) {
    await this.deleteSlaConfig.execute(data.id)
    return { id: data.id }
  }

  @GrpcMethod('SchedulerService', 'ListSlaConfigs')
  async listSlaConfigsHandler(data: ListSlaConfigsRequest) {
    const result = await this.listSlaConfigs.execute(data)
    return { jsonItems: result.map((config: SlaConfig) => JSON.stringify(SchedulerMapper.slaConfigToResponse(config))) }
  }

  @GrpcMethod('SchedulerService', 'CheckSlaViolations')
  async checkSlaViolationsHandler(data: CheckSlaViolationsRequest) {
    const result = await this.checkSlaViolations.execute(data)
    return { jsonItems: result.map((violation: SlaViolation) => JSON.stringify(SchedulerMapper.violationToResponse(violation))) }
  }

  @GrpcMethod('SchedulerService', 'ListSlaViolations')
  async listViolationsHandler(data: ListSlaViolationsRequest) {
    const result = await this.listViolations.execute(data)
    return {
      jsonItems: result.data.map((violation: SlaViolation) => JSON.stringify(SchedulerMapper.violationToResponse(violation))),
      nextCursor: result.nextCursor ?? '',
    }
  }

  @GrpcMethod('SchedulerService', 'ResolveSlaViolation')
  async resolveViolationHandler(data: ResolveSlaViolationRequest) {
    const result = await this.resolveViolation.execute(data)
    return { json: JSON.stringify(SchedulerMapper.violationToResponse(result)) }
  }
}
