import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { TagRepository } from "@/src/domain/crm/tags/tag.repository"
import type { Tag, TagUpdateInput } from "@/src/domain/crm/tags/tag.entity"

export class UpdateTagUseCase {
  constructor(private repository: TagRepository) {}

  async execute(id: string, data: TagUpdateInput): Promise<Result<Tag>> {
    try {
      const tag = await this.repository.update(id, data)
      return success(tag)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
