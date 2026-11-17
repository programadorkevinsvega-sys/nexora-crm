import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type {
  CreateNote, UpdateNote, Note,
  CreateTask, UpdateTask, Task,
  CreateCall, Call,
} from '@crm/contracts'

export interface NoteFilters {
  cursor?: string
  limit?: number
  contactId?: string
  companyId?: string
  dealId?: string
  authorUserId?: string
}

export interface TaskFilters {
  cursor?: string
  limit?: number
  assignedUserId?: string
  isCompleted?: boolean
  contactId?: string
}

export interface CallFilters {
  cursor?: string
  limit?: number
  contactId?: string
  callType?: string
}

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
}

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'interactions:'

@Injectable()
export class InteractionsBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async createNote(dto: CreateNote, tenantId: string): Promise<Note> {
    const note = await this.api.createNote({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return note
  }

  async listNotes(filters: NoteFilters, tenantId: string): Promise<PaginatedResult<Note>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}notes:${tenantId}:${qs}`
    return this.cache.getOrSet<PaginatedResult<Note>>(
      cacheKey,
      () => this.api.listNotes({ tenantId, ...filters }),
      CACHE_TTL_MS,
    )
  }

  async getNote(id: string, tenantId: string): Promise<Note> {
    const cacheKey = `${CACHE_KEY_PREFIX}note:${id}:${tenantId}`
    return this.cache.getOrSet<Note>(
      cacheKey,
      () => this.api.getNote(tenantId, id),
      CACHE_TTL_MS,
    )
  }

  async updateNote(id: string, dto: UpdateNote, tenantId: string): Promise<Note> {
    await this.api.updateNote({ tenantId, id, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getNote(tenantId, id)
  }

  async deleteNote(id: string, tenantId: string): Promise<void> {
    await this.api.deleteNote(tenantId, id)
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }

  async createTask(dto: CreateTask, tenantId: string): Promise<Task> {
    const task = await this.api.createTask({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return task
  }

  async listTasks(filters: TaskFilters, tenantId: string): Promise<PaginatedResult<Task>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}tasks:${tenantId}:${qs}`
    return this.cache.getOrSet<PaginatedResult<Task>>(
      cacheKey,
      () => this.api.listTasks({ tenantId, ...filters }),
      CACHE_TTL_MS,
    )
  }

  async getTask(id: string, tenantId: string): Promise<Task> {
    const cacheKey = `${CACHE_KEY_PREFIX}task:${id}:${tenantId}`
    return this.cache.getOrSet<Task>(
      cacheKey,
      () => this.api.getTask(tenantId, id),
      CACHE_TTL_MS,
    )
  }

  async updateTask(id: string, dto: UpdateTask, tenantId: string): Promise<Task> {
    await this.api.updateTask({ tenantId, id, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return this.api.getTask(tenantId, id)
  }

  async deleteTask(id: string, tenantId: string): Promise<void> {
    await this.api.deleteTask(tenantId, id)
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }

  async createCall(dto: CreateCall & { authorUserId: string }, tenantId: string): Promise<Call> {
    const call = await this.api.createCall({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return call
  }

  async listCalls(filters: CallFilters, tenantId: string): Promise<PaginatedResult<Call>> {
    const qs = JSON.stringify(filters)
    const cacheKey = `${CACHE_KEY_PREFIX}calls:${tenantId}:${qs}`
    return this.cache.getOrSet<PaginatedResult<Call>>(
      cacheKey,
      () => this.api.listCalls({ tenantId, ...filters }),
      CACHE_TTL_MS,
    )
  }

  async getCall(id: string, tenantId: string): Promise<Call> {
    const cacheKey = `${CACHE_KEY_PREFIX}call:${id}:${tenantId}`
    return this.cache.getOrSet<Call>(
      cacheKey,
      () => this.api.getCall(tenantId, id),
      CACHE_TTL_MS,
    )
  }
}
