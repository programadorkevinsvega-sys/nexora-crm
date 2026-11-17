import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { ContractRepository } from "@/src/domain/crm/contracts/contract.repository"
import type { Contract, ContractUpdateInput } from "@/src/domain/crm/contracts/contract.entity"

export class UpdateContractUseCase {
  constructor(private repository: ContractRepository) {}

  async execute(id: string, data: ContractUpdateInput): Promise<Result<Contract>> {
    try {
      const contract = await this.repository.update(id, data)
      return success(contract)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
