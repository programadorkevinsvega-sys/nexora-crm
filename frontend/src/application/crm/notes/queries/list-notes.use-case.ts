import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { NoteRepository, NoteFilters } from "@/src/domain/crm/notes/note.repository"
import type { Note } from "@/src/domain/crm/notes/note.entity"

export class ListNotesUseCase {
  constructor(private repository: NoteRepository) {}

  async execute(filters?: NoteFilters, pagination?: Pagination): Promise<Result<PaginatedResult<Note>>> {
    try {
      const result = await this.repository.list(filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
