import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { ContractRepository } from "@/src/domain/crm/contracts/contract.repository"

export class DeleteContractUseCase {
  constructor(private repository: ContractRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      await this.repository.delete(id)
      return success(undefined)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
