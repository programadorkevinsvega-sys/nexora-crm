import type { Repository } from "../common/repositories/repository.interface"
import type { Contract, ContractCreateInput, ContractUpdateInput } from "./contract.entity"

export interface ContractFilters {
  companyId?: string
  status?: string
  tenantId?: string
  search?: string
  cursor?: string
  limit?: number
}

export type ContractRepository = Repository<Contract, ContractCreateInput, ContractUpdateInput, ContractFilters>
