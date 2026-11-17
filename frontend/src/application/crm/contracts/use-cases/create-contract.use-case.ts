import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { ContractRepository } from "@/src/domain/crm/contracts/contract.repository"
import type { Contract, ContractCreateInput } from "@/src/domain/crm/contracts/contract.entity"

export class CreateContractUseCase {
  constructor(private repository: ContractRepository) {}

  async execute(data: ContractCreateInput): Promise<Result<Contract>> {
    try {
      const contract = await this.repository.create(data)
      return success(contract)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
