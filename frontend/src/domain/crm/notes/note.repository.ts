import type { Repository } from "../common/repositories/repository.interface"
import type { Note, NoteCreateInput, NoteUpdateInput } from "./note.entity"

export interface NoteFilters {
  contactId?: string
  companyId?: string
  dealId?: string
  authorUserId?: string
  tenantId?: string
  search?: string
  cursor?: string
  limit?: number
}

export type NoteRepository = Repository<Note, NoteCreateInput, NoteUpdateInput, NoteFilters>
