import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { NoteRepository } from "@/src/domain/crm/notes/note.repository"
import type { Note, NoteCreateInput } from "@/src/domain/crm/notes/note.entity"

export class CreateNoteUseCase {
  constructor(private repository: NoteRepository) {}

  async execute(data: NoteCreateInput): Promise<Result<Note>> {
    try {
      const note = await this.repository.create(data)
      return success(note)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
