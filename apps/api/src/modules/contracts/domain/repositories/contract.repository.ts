import { Contract } from '../entities/contract.entity'

export interface ContractFilter {
  status?: string
  companyId?: string
  cursor?: string
  limit: number
}

export interface PaginatedContracts {
  data: Contract[]
  nextCursor: string | null
}

export abstract class ContractRepository {
  abstract findById(tenantId: string, id: string): Promise<Contract | null>
  abstract list(tenantId: string, filter: ContractFilter): Promise<PaginatedContracts>
  abstract save(contract: Contract): Promise<void>
  abstract delete(tenantId: string, id: string): Promise<void>
}
