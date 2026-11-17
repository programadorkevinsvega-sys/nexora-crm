import { NoteFilter } from '../../domain/repositories/note.repository'
import { TaskFilter } from '../../domain/repositories/task.repository'
import { CallFilter } from '../../domain/repositories/call.repository'

export class GetNoteQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListNotesQuery {
  constructor(readonly tenantId: string, readonly filter: NoteFilter) {}
}

export class GetTaskQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListTasksQuery {
  constructor(readonly tenantId: string, readonly filter: TaskFilter) {}
}

export class GetCallQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListCallsQuery {
  constructor(readonly tenantId: string, readonly filter: CallFilter) {}
}
