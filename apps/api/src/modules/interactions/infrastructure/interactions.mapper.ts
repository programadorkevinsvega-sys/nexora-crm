import { Note } from '../domain/entities/note.entity'
import { Task } from '../domain/entities/task.entity'
import { Call, CallType } from '../domain/entities/call.entity'

type NoteRow = {
  id: string
  tenantId: string
  contactId: string | null
  companyId: string | null
  dealId: string | null
  content: string
  authorUserId: string
  createdAt: Date
  updatedAt: Date
}

type TaskRow = {
  id: string
  tenantId: string
  contactId: string | null
  companyId: string | null
  dealId: string | null
  title: string
  description: string | null
  dueDate: Date
  isCompleted: boolean | null
  assignedUserId: string
  createdAt: Date
  updatedAt: Date
}

type CallRow = {
  id: string
  tenantId: string
  contactId: string | null
  callType: string | null
  durationSeconds: number | null
  summary: string | null
  happenedAt: Date
  authorUserId: string
  createdAt: Date
}

export class NoteMapper {
  static toDomain(row: NoteRow): Note {
    return new Note(
      row.id,
      row.tenantId,
      row.contactId,
      row.companyId,
      row.dealId,
      row.content,
      row.authorUserId,
      row.createdAt,
      row.updatedAt,
    )
  }

  static toPersistence(note: Note): NoteRow {
    return {
      id: note.id,
      tenantId: note.tenantId,
      contactId: note.contactId,
      companyId: note.companyId,
      dealId: note.dealId,
      content: note.content,
      authorUserId: note.authorUserId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }
  }

  static toResponse(note: Note) {
    return {
      id: note.id,
      contactId: note.contactId,
      companyId: note.companyId,
      dealId: note.dealId,
      content: note.content,
      authorUserId: note.authorUserId,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    }
  }
}

export class TaskMapper {
  static toDomain(row: TaskRow): Task {
    return new Task(
      row.id,
      row.tenantId,
      row.contactId,
      row.companyId,
      row.dealId,
      row.title,
      row.description,
      row.dueDate,
      row.isCompleted ?? false,
      row.assignedUserId,
      row.createdAt,
      row.updatedAt,
    )
  }

  static toPersistence(task: Task): TaskRow {
    return {
      id: task.id,
      tenantId: task.tenantId,
      contactId: task.contactId,
      companyId: task.companyId,
      dealId: task.dealId,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      isCompleted: task.isCompleted,
      assignedUserId: task.assignedUserId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }
  }

  static toResponse(task: Task) {
    return {
      id: task.id,
      contactId: task.contactId,
      companyId: task.companyId,
      dealId: task.dealId,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.toISOString(),
      isCompleted: task.isCompleted,
      assignedUserId: task.assignedUserId,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }
  }
}

export class CallMapper {
  static toDomain(row: CallRow): Call {
    return new Call(
      row.id,
      row.tenantId,
      row.contactId,
      row.callType as CallType,
      row.durationSeconds,
      row.summary,
      row.happenedAt,
      row.authorUserId,
      row.createdAt,
    )
  }

  static toPersistence(call: Call): CallRow {
    return {
      id: call.id,
      tenantId: call.tenantId,
      contactId: call.contactId,
      callType: call.callType,
      durationSeconds: call.durationSeconds,
      summary: call.summary,
      happenedAt: call.happenedAt,
      authorUserId: call.authorUserId,
      createdAt: call.createdAt,
    }
  }

  static toResponse(call: Call) {
    return {
      id: call.id,
      contactId: call.contactId,
      callType: call.callType,
      durationSeconds: call.durationSeconds,
      summary: call.summary,
      happenedAt: call.happenedAt.toISOString(),
      authorUserId: call.authorUserId,
      createdAt: call.createdAt.toISOString(),
    }
  }
}
