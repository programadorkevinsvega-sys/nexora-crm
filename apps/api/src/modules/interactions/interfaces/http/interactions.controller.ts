import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import {
  CreateNoteHandler, UpdateNoteHandler, DeleteNoteHandler,
  CreateTaskHandler, UpdateTaskHandler, DeleteTaskHandler,
  CreateCallHandler,
} from '../../application/commands/interactions.handlers'
import {
  GetNoteHandler, ListNotesHandler,
  GetTaskHandler, ListTasksHandler,
  GetCallHandler, ListCallsHandler,
} from '../../application/queries/interactions.handlers'
import {
  CreateNoteCommand, UpdateNoteCommand, DeleteNoteCommand,
  CreateTaskCommand, UpdateTaskCommand, DeleteTaskCommand,
  CreateCallCommand,
} from '../../application/commands/interactions.commands'
import {
  GetNoteQuery, ListNotesQuery,
  GetTaskQuery, ListTasksQuery,
  GetCallQuery, ListCallsQuery,
} from '../../application/queries/interactions.queries'
import { CreateNoteDto, UpdateNoteDto, CreateTaskDto, UpdateTaskDto, CreateCallDto } from './dto/interactions.dto'
import { TenantId, UserId } from '../../../../common/decorators/tenant-id.decorator'
import { NoteMapper, TaskMapper, CallMapper } from '../../infrastructure/interactions.mapper'

@Controller('interactions')
export class InteractionsController {
  constructor(
    private readonly createNoteHandler: CreateNoteHandler,
    private readonly updateNoteHandler: UpdateNoteHandler,
    private readonly deleteNoteHandler: DeleteNoteHandler,
    private readonly getNoteHandler: GetNoteHandler,
    private readonly listNotesHandler: ListNotesHandler,
    private readonly createTaskHandler: CreateTaskHandler,
    private readonly updateTaskHandler: UpdateTaskHandler,
    private readonly deleteTaskHandler: DeleteTaskHandler,
    private readonly getTaskHandler: GetTaskHandler,
    private readonly listTasksHandler: ListTasksHandler,
    private readonly createCallHandler: CreateCallHandler,
    private readonly getCallHandler: GetCallHandler,
    private readonly listCallsHandler: ListCallsHandler,
  ) {}

  @Post('notes')
  async createNote(@Body() dto: CreateNoteDto, @TenantId() tenantId: string, @UserId() userId: string) {
    const result = await this.createNoteHandler.execute(
      new CreateNoteCommand(tenantId, dto.content, userId, dto.contactId, dto.companyId, dto.dealId),
    )
    return result
  }

  @Get('notes')
  async listNotes(
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('contactId') contactId: string | undefined,
    @Query('companyId') companyId: string | undefined,
    @Query('dealId') dealId: string | undefined,
    @TenantId() tenantId: string,
  ) {
    const result = await this.listNotesHandler.execute(
      new ListNotesQuery(tenantId, {
        contactId,
        companyId,
        dealId,
        cursor,
        limit: Math.min(Number(limit) || 20, 100),
      }),
    )
    return {
      data: result.data.map(NoteMapper.toResponse),
      nextCursor: result.nextCursor,
    }
  }

  @Get('notes/:id')
  async getNote(@Param('id') id: string, @TenantId() tenantId: string) {
    const note = await this.getNoteHandler.execute(new GetNoteQuery(tenantId, id))
    return NoteMapper.toResponse(note)
  }

  @Put('notes/:id')
  async updateNote(@Param('id') id: string, @Body() dto: UpdateNoteDto, @TenantId() tenantId: string) {
    await this.updateNoteHandler.execute(
      new UpdateNoteCommand(tenantId, id, dto.content, dto.contactId, dto.companyId, dto.dealId),
    )
    return { id }
  }

  @Delete('notes/:id')
  async deleteNote(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.deleteNoteHandler.execute(new DeleteNoteCommand(tenantId, id))
    return { id }
  }

  @Post('tasks')
  async createTask(@Body() dto: CreateTaskDto, @TenantId() tenantId: string, @UserId() userId: string) {
    const result = await this.createTaskHandler.execute(
      new CreateTaskCommand(
        tenantId, dto.title, new Date(dto.dueDate), dto.assignedUserId || userId,
        dto.contactId, dto.companyId, dto.dealId, dto.description, dto.isCompleted,
      ),
    )
    return result
  }

  @Get('tasks')
  async listTasks(
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('contactId') contactId: string | undefined,
    @Query('companyId') companyId: string | undefined,
    @Query('dealId') dealId: string | undefined,
    @Query('assignedUserId') assignedUserId: string | undefined,
    @Query('isCompleted') isCompleted: string | undefined,
    @TenantId() tenantId: string,
  ) {
    const result = await this.listTasksHandler.execute(
      new ListTasksQuery(tenantId, {
        contactId,
        companyId,
        dealId,
        assignedUserId,
        isCompleted: isCompleted !== undefined ? isCompleted === 'true' : undefined,
        cursor,
        limit: Math.min(Number(limit) || 20, 100),
      }),
    )
    return {
      data: result.data.map(TaskMapper.toResponse),
      nextCursor: result.nextCursor,
    }
  }

  @Get('tasks/:id')
  async getTask(@Param('id') id: string, @TenantId() tenantId: string) {
    const task = await this.getTaskHandler.execute(new GetTaskQuery(tenantId, id))
    return TaskMapper.toResponse(task)
  }

  @Put('tasks/:id')
  async updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto, @TenantId() tenantId: string) {
    await this.updateTaskHandler.execute(
      new UpdateTaskCommand(
        tenantId, id, dto.title, dto.description,
        dto.dueDate ? new Date(dto.dueDate) : undefined,
        dto.isCompleted, dto.contactId, dto.companyId, dto.dealId, dto.assignedUserId,
      ),
    )
    return { id }
  }

  @Delete('tasks/:id')
  async deleteTask(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.deleteTaskHandler.execute(new DeleteTaskCommand(tenantId, id))
    return { id }
  }

  @Post('calls')
  async createCall(@Body() dto: CreateCallDto, @TenantId() tenantId: string, @UserId() userId: string) {
    const result = await this.createCallHandler.execute(
      new CreateCallCommand(
        tenantId, dto.callType ?? 'OUTBOUND', new Date(dto.happenedAt), userId,
        dto.contactId, dto.durationSeconds, dto.summary,
      ),
    )
    return result
  }

  @Get('calls')
  async listCalls(
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('contactId') contactId: string | undefined,
    @TenantId() tenantId: string,
  ) {
    const result = await this.listCallsHandler.execute(
      new ListCallsQuery(tenantId, {
        contactId,
        cursor,
        limit: Math.min(Number(limit) || 20, 100),
      }),
    )
    return {
      data: result.data.map(CallMapper.toResponse),
      nextCursor: result.nextCursor,
    }
  }

  @Get('calls/:id')
  async getCall(@Param('id') id: string, @TenantId() tenantId: string) {
    const call = await this.getCallHandler.execute(new GetCallQuery(tenantId, id))
    return CallMapper.toResponse(call)
  }
}
