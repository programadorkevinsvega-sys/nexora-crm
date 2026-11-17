import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { ThreadRepository } from "@/src/domain/crm/helpdesk/thread.repository"
import type { Thread, ThreadCreateInput } from "@/src/domain/crm/helpdesk/thread.entity"

export class CreateThreadUseCase {
  constructor(private repository: ThreadRepository) {}

  async execute(data: ThreadCreateInput): Promise<Result<Thread>> {
    try {
      const thread = await this.repository.create(data)
      return success(thread)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
