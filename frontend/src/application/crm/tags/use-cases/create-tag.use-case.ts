import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { TagRepository } from "@/src/domain/crm/tags/tag.repository"
import type { Tag, TagCreateInput } from "@/src/domain/crm/tags/tag.entity"

export class CreateTagUseCase {
  constructor(private repository: TagRepository) {}

  async execute(data: TagCreateInput): Promise<Result<Tag>> {
    try {
      const tag = await this.repository.create(data)
      return success(tag)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
