import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { z } from 'zod'
import {
  CreateNoteSchema,
  UpdateNoteSchema,
  CreateTaskSchema,
  UpdateTaskSchema,
  CreateCallSchema,
} from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { InteractionsBffService, NoteFilters, TaskFilters, CallFilters, PaginatedResult } from './interactions.bff.service'
import type { CreateNote, UpdateNote, Note, CreateTask, UpdateTask, Task, CreateCall, Call } from '@crm/contracts'

const CreateCallBodySchema = CreateCallSchema.extend({
  authorUserId: z.string().uuid(),
})

@Controller('api')
export class InteractionsBffController {
  constructor(private readonly service: InteractionsBffService) {}

  @Get('notes')
  async listNotes(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('contactId') contactId?: string,
    @Query('companyId') companyId?: string,
    @Query('dealId') dealId?: string,
    @Query('authorUserId') authorUserId?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Note>> {
    const filters: NoteFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      contactId,
      companyId,
      dealId,
      authorUserId,
    }
    return this.service.listNotes(filters, tenantId!)
  }

  @Post('notes')
  async createNote(
    @Body(createZodPipe(CreateNoteSchema)) dto: CreateNote,
    @Headers('X-Tenant-Id') tenantId?: string,
    @Headers('X-User-Id') userId?: string,
  ): Promise<Note> {
    const authorUserId = dto.authorUserId || userId || '00000000-0000-0000-0000-000000000002'
    return this.service.createNote({ ...dto, authorUserId }, tenantId!)
  }

  @Get('notes/:id')
  async getNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Note> {
    return this.service.getNote(id, tenantId!)
  }

  @Put('notes/:id')
  async updateNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(UpdateNoteSchema)) dto: UpdateNote,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Note> {
    return this.service.updateNote(id, dto, tenantId!)
  }

  @Delete('notes/:id')
  async deleteNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.deleteNote(id, tenantId!)
  }

  @Get('tasks')
  async listTasks(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('assignedUserId') assignedUserId?: string,
    @Query('isCompleted') isCompleted?: string,
    @Query('contactId') contactId?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Task>> {
    const filters: TaskFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      assignedUserId,
      isCompleted: isCompleted !== undefined ? isCompleted === 'true' : undefined,
      contactId,
    }
    return this.service.listTasks(filters, tenantId!)
  }

  @Post('tasks')
  async createTask(
    @Body(createZodPipe(CreateTaskSchema)) dto: CreateTask,
    @Headers('X-Tenant-Id') tenantId?: string,
    @Headers('X-User-Id') userId?: string,
  ): Promise<Task> {
    const assignedUserId = dto.assignedUserId || userId || '00000000-0000-0000-0000-000000000002'
    let dueDate = dto.dueDate
    if (dueDate && !dueDate.includes('T')) {
      dueDate = new Date(dueDate).toISOString()
    }
    return this.service.createTask({ ...dto, dueDate, assignedUserId }, tenantId!)
  }

  @Get('tasks/:id')
  async getTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Task> {
    return this.service.getTask(id, tenantId!)
  }

  @Put('tasks/:id')
  async updateTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(UpdateTaskSchema)) dto: UpdateTask,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Task> {
    return this.service.updateTask(id, dto, tenantId!)
  }

  @Delete('tasks/:id')
  async deleteTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.deleteTask(id, tenantId!)
  }

  @Get('calls')
  async listCalls(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('contactId') contactId?: string,
    @Query('callType') callType?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Call>> {
    const filters: CallFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      contactId,
      callType,
    }
    return this.service.listCalls(filters, tenantId!)
  }

  @Post('calls')
  async createCall(
    @Body(createZodPipe(CreateCallSchema)) dto: CreateCall,
    @Headers('X-Tenant-Id') tenantId?: string,
    @Headers('X-User-Id') userId?: string,
  ): Promise<Call> {
    const authorUserId = dto.authorUserId || userId || '00000000-0000-0000-0000-000000000002'
    let happenedAt = dto.happenedAt
    if (happenedAt && !happenedAt.includes('T')) {
      happenedAt = new Date(happenedAt).toISOString()
    }
    return this.service.createCall({ ...dto, happenedAt, authorUserId }, tenantId!)
  }

  @Get('calls/:id')
  async getCall(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Call> {
    return this.service.getCall(id, tenantId!)
  }
}
