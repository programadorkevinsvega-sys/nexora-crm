import { api, qs } from "../../api/api-client"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { NoteFilters } from "@/src/domain/crm/notes/note.repository"
import type { Note, NoteCreateInput, NoteUpdateInput } from "@/src/domain/crm/notes/note.entity"

export const ApiNoteRepository = {
  async list(filters: NoteFilters = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Note>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Note>>(`/api/notes${qs(params)}`)
  },
  async getById(id: string): Promise<Note> {
    return api.get<Note>(`/api/notes/${id}`)
  },
  async create(data: NoteCreateInput): Promise<Note> {
    return api.post<Note>("/api/notes", data)
  },
  async update(id: string, data: NoteUpdateInput): Promise<Note> {
    return api.put<Note>(`/api/notes/${id}`, data)
  },
  async delete(id: string): Promise<void> {
    return api.delete(`/api/notes/${id}`)
  },
}
