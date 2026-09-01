import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateTaskHandler, UpdateTaskHandler, DeleteTaskHandler,
  CreateCallHandler,
} from '../../application/commands/interactions.handlers'
import {
  GetTaskHandler, ListTasksHandler,
  GetCallHandler, ListCallsHandler,
} from '../../application/queries/interactions.handlers'
import {
  CreateTaskCommand, UpdateTaskCommand, DeleteTaskCommand,
  CreateCallCommand,
} from '../../application/commands/interactions.commands'
import {
  GetTaskQuery, ListTasksQuery,
  GetCallQuery, ListCallsQuery,
} from '../../application/queries/interactions.queries'
import { TaskMapper, CallMapper } from '../../infrastructure/interactions.mapper'

@Controller()
export class TasksCallsGrpcController {
  constructor(
    private readonly createTaskHandler: CreateTaskHandler,
    private readonly updateTaskHandler: UpdateTaskHandler,
    private readonly deleteTaskHandler: DeleteTaskHandler,
    private readonly getTaskHandler: GetTaskHandler,
    private readonly listTasksHandler: ListTasksHandler,
    private readonly createCallHandler: CreateCallHandler,
    private readonly getCallHandler: GetCallHandler,
    private readonly listCallsHandler: ListCallsHandler,
  ) {}

  @GrpcMethod('InteractionService', 'CreateTask')
  async createTask(data: {
    tenantId: string
    title: string
    dueDate: string
    assignedUserId: string
    contactId?: string
    companyId?: string
    dealId?: string
    description?: string
    isCompleted?: boolean
  }) {
    const result = await this.createTaskHandler.execute(
      new CreateTaskCommand(
        data.tenantId, data.title, new Date(data.dueDate), data.assignedUserId,
        data.contactId, data.companyId, data.dealId,
        data.description, data.isCompleted,
      ),
    )
    const task = await this.getTaskHandler.execute(
      new GetTaskQuery(data.tenantId, result.id),
    )
    return { json: JSON.stringify(TaskMapper.toResponse(task)) }
  }

  @GrpcMethod('InteractionService', 'GetTask')
  async getTask(data: { tenantId: string; id: string }) {
    const task = await this.getTaskHandler.execute(
      new GetTaskQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(TaskMapper.toResponse(task)) }
  }

  @GrpcMethod('InteractionService', 'ListTasks')
  async listTasks(data: {
    tenantId: string
    cursor?: string
    limit?: number
    contactId?: string
    companyId?: string
    dealId?: string
    assignedUserId?: string
    isCompleted?: boolean
  }) {
    const result = await this.listTasksHandler.execute(
      new ListTasksQuery(data.tenantId, {
        contactId: data.contactId,
        companyId: data.companyId,
        dealId: data.dealId,
        assignedUserId: data.assignedUserId,
        isCompleted: data.isCompleted,
        cursor: data.cursor,
        limit: Math.min(data.limit || 20, 100),
      }),
    )
    return {
      jsonItems: result.data.map((t) => JSON.stringify(TaskMapper.toResponse(t))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('InteractionService', 'UpdateTask')
  async updateTask(data: {
    tenantId: string
    id: string
    title?: string
    description?: string
    dueDate?: string
    isCompleted?: boolean
    contactId?: string
    companyId?: string
    dealId?: string
    assignedUserId?: string
  }) {
    await this.updateTaskHandler.execute(
      new UpdateTaskCommand(
        data.tenantId, data.id,
        data.title, data.description,
        data.dueDate ? new Date(data.dueDate) : undefined,
        data.isCompleted, data.contactId, data.companyId, data.dealId,
        data.assignedUserId,
      ),
    )
    return {}
  }

  @GrpcMethod('InteractionService', 'DeleteTask')
  async deleteTask(data: { tenantId: string; id: string }) {
    await this.deleteTaskHandler.execute(
      new DeleteTaskCommand(data.tenantId, data.id),
    )
    return {}
  }

  @GrpcMethod('InteractionService', 'CreateCall')
  async createCall(data: {
    tenantId: string
    callType: string
    happenedAt: string
    authorUserId: string
    contactId?: string
    durationSeconds?: number
    summary?: string
  }) {
    const result = await this.createCallHandler.execute(
      new CreateCallCommand(
        data.tenantId, data.callType as 'INBOUND' | 'OUTBOUND' | 'MEETING',
        new Date(data.happenedAt), data.authorUserId,
        data.contactId, data.durationSeconds, data.summary,
      ),
    )
    const call = await this.getCallHandler.execute(
      new GetCallQuery(data.tenantId, result.id),
    )
    return { json: JSON.stringify(CallMapper.toResponse(call)) }
  }

  @GrpcMethod('InteractionService', 'GetCall')
  async getCall(data: { tenantId: string; id: string }) {
    const call = await this.getCallHandler.execute(
      new GetCallQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(CallMapper.toResponse(call)) }
  }

  @GrpcMethod('InteractionService', 'ListCalls')
  async listCalls(data: {
    tenantId: string
    cursor?: string
    limit?: number
    contactId?: string
  }) {
    const result = await this.listCallsHandler.execute(
      new ListCallsQuery(data.tenantId, {
        contactId: data.contactId,
        cursor: data.cursor,
        limit: Math.min(data.limit || 20, 100),
      }),
    )
    return {
      jsonItems: result.data.map((c) => JSON.stringify(CallMapper.toResponse(c))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }
}
