import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { CallRepository } from "@/src/domain/crm/calls/call.repository"
import type { Call, CallCreateInput } from "@/src/domain/crm/calls/call.entity"

export class CreateCallUseCase {
  constructor(private repository: CallRepository) {}

  async execute(data: CallCreateInput): Promise<Result<Call>> {
    try {
      const call = await this.repository.create(data)
      return success(call)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
