import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { NoteRepository } from "@/src/domain/crm/notes/note.repository"
import type { Note, NoteUpdateInput } from "@/src/domain/crm/notes/note.entity"

export class UpdateNoteUseCase {
  constructor(private repository: NoteRepository) {}

  async execute(id: string, data: NoteUpdateInput): Promise<Result<Note>> {
    try {
      const note = await this.repository.update(id, data)
      return success(note)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
