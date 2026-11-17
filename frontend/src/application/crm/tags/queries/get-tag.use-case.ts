import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { TagRepository } from "@/src/domain/crm/tags/tag.repository"
import type { Tag } from "@/src/domain/crm/tags/tag.entity"

export class GetTagUseCase {
  constructor(private repository: TagRepository) {}

  async execute(id: string): Promise<Result<Tag | null>> {
    try {
      const tag = await this.repository.getById(id)
      return success(tag)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
