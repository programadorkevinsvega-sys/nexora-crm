import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { TagRepository } from "@/src/domain/crm/tags/tag.repository"

export class DeleteTagUseCase {
  constructor(private repository: TagRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      await this.repository.delete(id)
      return success(undefined)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
