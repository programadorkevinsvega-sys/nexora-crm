import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { LifeEventRepository } from "@/src/domain/crm/personal-crm/life-event.repository"
import type { LifeEvent, LifeEventCreateInput } from "@/src/domain/crm/personal-crm/life-event.entity"

export class CreateLifeEventUseCase {
  constructor(private repository: LifeEventRepository) {}

  async execute(data: LifeEventCreateInput): Promise<Result<LifeEvent>> {
    try {
      const event = await this.repository.create(data)
      return success(event)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
