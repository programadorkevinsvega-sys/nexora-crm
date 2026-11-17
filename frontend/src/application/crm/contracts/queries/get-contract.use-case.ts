import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { ContractRepository } from "@/src/domain/crm/contracts/contract.repository"
import type { Contract } from "@/src/domain/crm/contracts/contract.entity"

export class GetContractUseCase {
  constructor(private repository: ContractRepository) {}

  async execute(id: string): Promise<Result<Contract | null>> {
    try {
      const contract = await this.repository.getById(id)
      return success(contract)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
