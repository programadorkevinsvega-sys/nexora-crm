import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { ContractRepository } from "@/src/domain/crm/contracts/contract.repository"
import type { Contract } from "@/src/domain/crm/contracts/contract.entity"

export interface ContractRepositoryExtended extends ContractRepository {
  renew(id: string): Promise<Contract>
}

export class RenewContractUseCase {
  constructor(private repository: ContractRepositoryExtended) {}

  async execute(id: string): Promise<Result<Contract>> {
    try {
      const contract = await this.repository.renew(id)
      return success(contract)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
