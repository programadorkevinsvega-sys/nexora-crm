import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { GiftRepository } from "@/src/domain/crm/personal-crm/gift.repository"
import type { Gift, GiftCreateInput } from "@/src/domain/crm/personal-crm/gift.entity"

export class CreateGiftUseCase {
  constructor(private repository: GiftRepository) {}

  async execute(data: GiftCreateInput): Promise<Result<Gift>> {
    try {
      const gift = await this.repository.create(data)
      return success(gift)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
