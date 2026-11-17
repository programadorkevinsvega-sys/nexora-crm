import { Injectable } from '@nestjs/common'
import { eq, and, asc, gt } from 'drizzle-orm'
import { getDb, contracts as contractsTable } from '@crm/database'
import { ContractRepository, ContractFilter, PaginatedContracts } from '../domain/repositories/contract.repository'
import { Contract } from '../domain/entities/contract.entity'
import { ContractMapper } from './contract.mapper'

@Injectable()
export class DrizzleContractRepository extends ContractRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<Contract | null> {
    const row = await this.db.query.contracts.findFirst({
      where: and(eq(contractsTable.tenantId, tenantId)!, eq(contractsTable.id, id)) as any,
    })
    return row ? ContractMapper.toDomain(row) : null
  }

  async list(tenantId: string, filter: ContractFilter): Promise<PaginatedContracts> {
    const conditions = [eq(contractsTable.tenantId, tenantId)]

    if (filter.cursor) conditions.push(gt(contractsTable.createdAt, new Date(filter.cursor)))
    if (filter.status) conditions.push(eq(contractsTable.status, filter.status))
    if (filter.companyId) conditions.push(eq(contractsTable.companyId, filter.companyId))

    const rows = await this.db.query.contracts.findMany({
      where: and(...conditions.filter(Boolean)!) as any,
      limit: filter.limit + 1,
      orderBy: [asc(contractsTable.createdAt), asc(contractsTable.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map(ContractMapper.toDomain),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async save(contract: Contract): Promise<void> {
    const row = ContractMapper.toPersistence(contract)
    await this.db.insert(contractsTable).values(row).onConflictDoUpdate({
      target: contractsTable.id,
      set: row,
    })
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(contractsTable).where(
      and(eq(contractsTable.tenantId, tenantId), eq(contractsTable.id, id)),
    )
  }
}
