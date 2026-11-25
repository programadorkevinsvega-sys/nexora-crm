import { Injectable } from '@nestjs/common'
import { ContractRepository } from '../../domain/repositories/contract.repository'
import { GetContractQuery, ListContractsQuery } from './contract.queries'
import { NotFoundError } from '@crm/shared'

@Injectable()
export class GetContractHandler {
  constructor(private readonly repo: ContractRepository) {}

  async execute(query: GetContractQuery) {
    const contract = await this.repo.findById(query.tenantId, query.id)
    if (!contract) throw new NotFoundError('Contract', query.id)
    return contract
  }
}

@Injectable()
export class ListContractsHandler {
  constructor(private readonly repo: ContractRepository) {}

  async execute(query: ListContractsQuery) {
    return this.repo.list(query.tenantId, query.filter)
  }
}
