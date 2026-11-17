import { ContractFilter } from '../../domain/repositories/contract.repository'

export class GetContractQuery {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListContractsQuery {
  constructor(readonly tenantId: string, readonly filter: ContractFilter) {}
}
