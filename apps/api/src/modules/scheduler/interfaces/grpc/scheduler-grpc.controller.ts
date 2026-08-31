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

@Controller()
export class SchedulerGrpcController {
  constructor(
    private readonly createTask: CreateTaskHandler, private readonly updateTask: UpdateTaskHandler,
    private readonly deleteTask: DeleteTaskHandler, private readonly executeTask: ExecuteTaskHandler,
    private readonly listTasks: ListTasksHandler, private readonly getTask: GetTaskHandler,
    private readonly listExecutions: ListExecutionsHandler,
    private readonly createReminder: CreateReminderHandler, private readonly updateReminder: UpdateReminderHandler,
    private readonly deleteReminder: DeleteReminderHandler, private readonly listReminders: ListRemindersHandler,
    private readonly getReminder: GetReminderHandler,
    private readonly createSlaConfig: CreateSlaConfigHandler, private readonly updateSlaConfig: UpdateSlaConfigHandler,
    private readonly deleteSlaConfig: DeleteSlaConfigHandler, private readonly listSlaConfigs: ListSlaConfigsHandler,
    private readonly checkSlaViolations: CheckSlaViolationsHandler, private readonly listViolations: ListSlaViolationsHandler,
    private readonly resolveViolation: ResolveSlaViolationHandler,
  ) {}

  @GrpcMethod('SchedulerService', 'CreateTask')
  async createTaskHandler(data: any) {
    const r = await this.createTask.execute(new CreateTaskCommand(data.tenantId, data.name, data.description, data.cronExpression, data.taskType, data.targetService, data.targetEndpoint, data.targetPayloadJson ? JSON.parse(data.targetPayloadJson) : undefined, data.enabled, data.maxRetries, data.timeoutSeconds, data.createdByUserId))
    return { json: JSON.stringify(SchedulerMapper.taskToResponse(r)) }
  }
  @GrpcMethod('SchedulerService', 'UpdateTask')
  async updateTaskHandler(data: any) {
    const r = await this.updateTask.execute(new UpdateTaskCommand(data.id, data.tenantId, data.name, data.description, data.cronExpression, data.targetService, data.targetEndpoint, data.targetPayloadJson ? JSON.parse(data.targetPayloadJson) : undefined, data.enabled, data.maxRetries, data.timeoutSeconds))
    return { json: JSON.stringify(SchedulerMapper.taskToResponse(r)) }
  }
  @GrpcMethod('SchedulerService', 'DeleteTask')
  async deleteTaskHandler(data: any) { await this.deleteTask.execute(data.id); return { id: data.id } }
  @GrpcMethod('SchedulerService', 'ListTasks')
  async listTasksHandler(data: any) {
    const r = await this.listTasks.execute(data); return { jsonItems: r.data.map((x: any) => JSON.stringify(SchedulerMapper.taskToResponse(x))), nextCursor: r.nextCursor ?? '' }
  }
  @GrpcMethod('SchedulerService', 'GetTask')
  async getTaskHandler(data: any) { const r = await this.getTask.execute(data.id); return { json: JSON.stringify(SchedulerMapper.taskToResponse(r)) } }
  @GrpcMethod('SchedulerService', 'ExecuteTask')
  async executeTaskHandler(data: any) {
    const r = await this.executeTask.execute(new ExecuteTaskCommand(data.id, data.tenantId))
    return { json: JSON.stringify(SchedulerMapper.executionToResponse(r)) }
  }
  @GrpcMethod('SchedulerService', 'ListTaskExecutions')
  async listExecutionsHandler(data: any) {
    const r = await this.listExecutions.execute(data); return { jsonItems: r.data.map((x: any) => JSON.stringify(SchedulerMapper.executionToResponse(x))), nextCursor: r.nextCursor ?? '' }
  }
  @GrpcMethod('SchedulerService', 'CreateReminder')
  async createReminderHandler(data: any) {
    const r = await this.createReminder.execute({ tenantId: data.tenantId, userId: data.userId, title: data.title, description: data.description, entityType: data.entityType, entityId: data.entityId, remindAt: new Date(data.remindAt), repeatInterval: data.repeatInterval, repeatCount: data.repeatCount })
    return { json: JSON.stringify(SchedulerMapper.reminderToResponse(r)) }
  }
  @GrpcMethod('SchedulerService', 'UpdateReminder')
  async updateReminderHandler(data: any) {
    const r = await this.updateReminder.execute({ id: data.id, tenantId: data.tenantId, title: data.title, description: data.description, remindAt: data.remindAt, reminded: data.reminded })
    return { json: JSON.stringify(SchedulerMapper.reminderToResponse(r)) }
  }
  @GrpcMethod('SchedulerService', 'DeleteReminder')
  async deleteReminderHandler(data: any) { await this.deleteReminder.execute(data.id); return { id: data.id } }
  @GrpcMethod('SchedulerService', 'ListReminders')
  async listRemindersHandler(data: any) {
    const r = await this.listReminders.execute(data); return { jsonItems: r.data.map((x: any) => JSON.stringify(SchedulerMapper.reminderToResponse(x))), nextCursor: r.nextCursor ?? '' }
  }
  @GrpcMethod('SchedulerService', 'GetReminder')
  async getReminderHandler(data: any) { const r = await this.getReminder.execute(data.id); return { json: JSON.stringify(SchedulerMapper.reminderToResponse(r)) } }
  @GrpcMethod('SchedulerService', 'CreateSlaConfig')
  async createSlaConfigHandler(data: any) {
    const r = await this.createSlaConfig.execute(data); return { json: JSON.stringify(SchedulerMapper.slaConfigToResponse(r)) }
  }
  @GrpcMethod('SchedulerService', 'UpdateSlaConfig')
  async updateSlaConfigHandler(data: any) {
    const r = await this.updateSlaConfig.execute(data); return { json: JSON.stringify(SchedulerMapper.slaConfigToResponse(r)) }
  }
  @GrpcMethod('SchedulerService', 'DeleteSlaConfig')
  async deleteSlaConfigHandler(data: any) { await this.deleteSlaConfig.execute(data.id); return { id: data.id } }
  @GrpcMethod('SchedulerService', 'ListSlaConfigs')
  async listSlaConfigsHandler(data: any) {
    const r = await this.listSlaConfigs.execute(data); return { jsonItems: r.map((x: any) => JSON.stringify(SchedulerMapper.slaConfigToResponse(x))) }
  }
  @GrpcMethod('SchedulerService', 'CheckSlaViolations')
  async checkSlaViolationsHandler(data: any) {
    const r = await this.checkSlaViolations.execute(data); return { jsonItems: r.map((x: any) => JSON.stringify(SchedulerMapper.violationToResponse(x))) }
  }
  @GrpcMethod('SchedulerService', 'ListSlaViolations')
  async listViolationsHandler(data: any) {
    const r = await this.listViolations.execute(data); return { jsonItems: r.data.map((x: any) => JSON.stringify(SchedulerMapper.violationToResponse(x))), nextCursor: r.nextCursor ?? '' }
  }
  @GrpcMethod('SchedulerService', 'ResolveSlaViolation')
  async resolveViolationHandler(data: any) {
    const r = await this.resolveViolation.execute(data); return { json: JSON.stringify(SchedulerMapper.violationToResponse(r)) }
  }
}
