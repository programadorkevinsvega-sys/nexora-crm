import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { ContractRepository } from "@/src/domain/crm/contracts/contract.repository"
import type { Contract } from "@/src/domain/crm/contracts/contract.entity"

export interface ContractRepositoryExtended extends ContractRepository {
  updateStatus(id: string, status: Contract["status"]): Promise<Contract>
}

export class UpdateContractStatusUseCase {
  constructor(private repository: ContractRepositoryExtended) {}

  async execute(id: string, status: Contract["status"]): Promise<Result<Contract>> {
    try {
      const contract = await this.repository.updateStatus(id, status)
      return success(contract)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
