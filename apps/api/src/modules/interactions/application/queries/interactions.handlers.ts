import { Injectable } from '@nestjs/common'
import { NoteRepository } from '../../domain/repositories/note.repository'
import { TaskRepository } from '../../domain/repositories/task.repository'
import { CallRepository } from '../../domain/repositories/call.repository'
import { GetNoteQuery, ListNotesQuery, GetTaskQuery, ListTasksQuery, GetCallQuery, ListCallsQuery } from './interactions.queries'
import { NotFoundError, ConflictError } from '@crm/shared'

@Injectable()
export class GetNoteHandler {
  constructor(private readonly repo: NoteRepository) {}

  async execute(query: GetNoteQuery) {
    const note = await this.repo.findById(query.tenantId, query.id)
    if (!note) throw new NotFoundError('Note', query.id)
    return note
  }
}

@Injectable()
export class ListNotesHandler {
  constructor(private readonly repo: NoteRepository) {}

  async execute(query: ListNotesQuery) {
    return this.repo.list(query.tenantId, query.filter)
  }
}

@Injectable()
export class GetTaskHandler {
  constructor(private readonly repo: TaskRepository) {}

  async execute(query: GetTaskQuery) {
    const task = await this.repo.findById(query.tenantId, query.id)
    if (!task) throw new NotFoundError('Task', query.id)
    return task
  }
}

@Injectable()
export class ListTasksHandler {
  constructor(private readonly repo: TaskRepository) {}

  async execute(query: ListTasksQuery) {
    return this.repo.list(query.tenantId, query.filter)
  }
}

@Injectable()
export class GetCallHandler {
  constructor(private readonly repo: CallRepository) {}

  async execute(query: GetCallQuery) {
    const call = await this.repo.findById(query.tenantId, query.id)
    if (!call) throw new NotFoundError('Call', query.id)
    return call
  }
}

@Injectable()
export class ListCallsHandler {
  constructor(private readonly repo: CallRepository) {}

  async execute(query: ListCallsQuery) {
    return this.repo.list(query.tenantId, query.filter)
  }
}
