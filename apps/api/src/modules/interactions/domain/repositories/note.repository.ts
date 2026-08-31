import { Note } from '../entities/note.entity'

export interface NoteFilter {
  contactId?: string
  companyId?: string
  dealId?: string
  cursor?: string
  limit: number
}

export interface PaginatedNotes {
  data: Note[]
  nextCursor: string | null
}

export abstract class NoteRepository {
  abstract findById(tenantId: string, id: string): Promise<Note | null>
  abstract list(tenantId: string, filter: NoteFilter): Promise<PaginatedNotes>
  abstract save(note: Note): Promise<void>
  abstract delete(tenantId: string, id: string): Promise<void>
}
