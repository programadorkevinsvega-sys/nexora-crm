import { Contract } from '../domain/entities/contract.entity'

type ContractRow = {
  id: string
  tenantId: string
  companyId: string
  dealId: string | null
  name: string
  startDate: string
  endDate: string | null
  autoRenew: boolean | null
  mrrValue: string | null
  status: string | null
  ownerUserId: string
  createdAt: Date
  updatedAt: Date
}

export class ContractMapper {
  static toDomain(row: ContractRow): Contract {
    return new Contract(
      row.id,
      row.tenantId,
      row.companyId,
      row.dealId,
      row.name,
      row.startDate,
      row.endDate,
      row.autoRenew ?? false,
      Number(row.mrrValue ?? 0),
      row.status as Contract['status'],
      row.ownerUserId,
      row.createdAt,
      row.updatedAt,
    )
  }

  static toPersistence(contract: Contract): ContractRow {
    return {
      id: contract.id,
      tenantId: contract.tenantId,
      companyId: contract.companyId,
      dealId: contract.dealId,
      name: contract.name,
      startDate: contract.startDate,
      endDate: contract.endDate,
      autoRenew: contract.autoRenew,
      mrrValue: contract.mrrValue.toString(),
      status: contract.status,
      ownerUserId: contract.ownerUserId,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    }
  }

  static toResponse(contract: Contract) {
    return {
      id: contract.id,
      companyId: contract.companyId,
      dealId: contract.dealId,
      name: contract.name,
      startDate: contract.startDate,
      endDate: contract.endDate,
      autoRenew: contract.autoRenew,
      mrrValue: contract.mrrValue,
      status: contract.status,
      ownerUserId: contract.ownerUserId,
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString(),
    }
  }
}
