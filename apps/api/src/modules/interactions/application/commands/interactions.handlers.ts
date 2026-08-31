import { Injectable } from '@nestjs/common'
import { NoteRepository } from '../../domain/repositories/note.repository'
import { TaskRepository } from '../../domain/repositories/task.repository'
import { CallRepository } from '../../domain/repositories/call.repository'
import { Note } from '../../domain/entities/note.entity'
import { Task } from '../../domain/entities/task.entity'
import { Call } from '../../domain/entities/call.entity'
import {
  CreateNoteCommand,
  UpdateNoteCommand,
  DeleteNoteCommand,
  CreateTaskCommand,
  UpdateTaskCommand,
  DeleteTaskCommand,
  CreateCallCommand,
} from './interactions.commands'
import { NoteCreatedEvent, NoteUpdatedEvent, NoteDeletedEvent } from '../../domain/events/note.events'
import { TaskCreatedEvent, TaskUpdatedEvent, TaskCompletedEvent, TaskDeletedEvent } from '../../domain/events/task.events'
import { CallCreatedEvent } from '../../domain/events/call.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { NotFoundError, ConflictError } from '@crm/shared'

@Injectable()
export class CreateNoteHandler {
  constructor(
    private readonly repo: NoteRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateNoteCommand): Promise<{ id: string }> {
    const note = Note.create({
      tenantId: command.tenantId,
      content: command.content,
      authorUserId: command.authorUserId,
      contactId: command.contactId,
      companyId: command.companyId,
      dealId: command.dealId,
    })

    await this.repo.save(note)
    await this.outbox.publish(new NoteCreatedEvent(note.id, note.content))

    return { id: note.id }
  }
}

@Injectable()
export class UpdateNoteHandler {
  constructor(
    private readonly repo: NoteRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateNoteCommand): Promise<void> {
    const note = await this.repo.findById(command.tenantId, command.id)
    if (!note) throw new NotFoundError('Note', command.id)

    const updated = note.update({
      content: command.content,
      contactId: command.contactId,
      companyId: command.companyId,
      dealId: command.dealId,
    })
    await this.repo.save(updated)
    await this.outbox.publish(new NoteUpdatedEvent(updated.id, updated.content))
  }
}

@Injectable()
export class DeleteNoteHandler {
  constructor(
    private readonly repo: NoteRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: DeleteNoteCommand): Promise<void> {
    await this.repo.delete(command.tenantId, command.id)
    await this.outbox.publish(new NoteDeletedEvent(command.id))
  }
}

@Injectable()
export class CreateTaskHandler {
  constructor(
    private readonly repo: TaskRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateTaskCommand): Promise<{ id: string }> {
    const task = Task.create({
      tenantId: command.tenantId,
      title: command.title,
      dueDate: command.dueDate,
      assignedUserId: command.assignedUserId,
      contactId: command.contactId,
      companyId: command.companyId,
      dealId: command.dealId,
      description: command.description,
      isCompleted: command.isCompleted,
    })

    await this.repo.save(task)
    await this.outbox.publish(new TaskCreatedEvent(task.id, task.title, task.assignedUserId))

    return { id: task.id }
  }
}

@Injectable()
export class UpdateTaskHandler {
  constructor(
    private readonly repo: TaskRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateTaskCommand): Promise<void> {
    const task = await this.repo.findById(command.tenantId, command.id)
    if (!task) throw new NotFoundError('Task', command.id)

    const wasCompleted = task.isCompleted
    const updated = task.update({
      title: command.title,
      description: command.description,
      dueDate: command.dueDate,
      isCompleted: command.isCompleted,
      contactId: command.contactId,
      companyId: command.companyId,
      dealId: command.dealId,
      assignedUserId: command.assignedUserId,
    })

    await this.repo.save(updated)
    await this.outbox.publish(new TaskUpdatedEvent(updated.id, updated.title, updated.isCompleted))

    if (command.isCompleted && !wasCompleted) {
      await this.outbox.publish(new TaskCompletedEvent(updated.id, updated.title))
    }
  }
}

@Injectable()
export class DeleteTaskHandler {
  constructor(
    private readonly repo: TaskRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: DeleteTaskCommand): Promise<void> {
    await this.repo.delete(command.tenantId, command.id)
    await this.outbox.publish(new TaskDeletedEvent(command.id))
  }
}

@Injectable()
export class CreateCallHandler {
  constructor(
    private readonly repo: CallRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateCallCommand): Promise<{ id: string }> {
    const call = Call.create({
      tenantId: command.tenantId,
      callType: command.callType,
      happenedAt: command.happenedAt,
      authorUserId: command.authorUserId,
      contactId: command.contactId,
      durationSeconds: command.durationSeconds,
      summary: command.summary,
    })

    await this.repo.save(call)
    await this.outbox.publish(new CallCreatedEvent(call.id, call.callType))

    return { id: call.id }
  }
}
