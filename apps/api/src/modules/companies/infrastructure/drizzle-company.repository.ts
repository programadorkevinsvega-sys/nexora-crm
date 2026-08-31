import { Injectable } from '@nestjs/common'
import { eq, ilike, and, asc, or, gt } from 'drizzle-orm'
import { getDb, companies as companiesTable } from '@crm/database'
import { CompanyRepository, CompanyFilter, PaginatedCompanies } from '../domain/repositories/company.repository'
import { Company } from '../domain/entities/company.entity'
import { CompanyMapper } from './company.mapper'

@Injectable()
export class DrizzleCompanyRepository extends CompanyRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<Company | null> {
    const row = await this.db.query.companies.findFirst({
      where: and(eq(companiesTable.tenantId, tenantId)!, eq(companiesTable.id, id)) as any,
    })
    return row ? CompanyMapper.toDomain(row) : null
  }

  async findByName(tenantId: string, name: string): Promise<Company | null> {
    const row = await this.db.query.companies.findFirst({
      where: and(eq(companiesTable.tenantId, tenantId)!, eq(companiesTable.name, name)) as any,
    })
    return row ? CompanyMapper.toDomain(row) : null
  }

  async list(tenantId: string, filter: CompanyFilter): Promise<PaginatedCompanies> {
    const conditions = [eq(companiesTable.tenantId, tenantId)]

    if (filter.cursor) conditions.push(gt(companiesTable.createdAt, new Date(filter.cursor)))
    if (filter.search) {
      conditions.push(or(
          ilike(companiesTable.name, `%${filter.search}%`)!,
          ilike(companiesTable.taxId, `%${filter.search}%`)!,
        )!,
      )
    }
    if (filter.industry) conditions.push(eq(companiesTable.industry, filter.industry))

    const rows = await this.db.query.companies.findMany({
      where: and(...conditions.filter(Boolean)!) as any,
      limit: filter.limit + 1,
      orderBy: [asc(companiesTable.createdAt), asc(companiesTable.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map(CompanyMapper.toDomain),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async save(company: Company): Promise<void> {
    const row = CompanyMapper.toPersistence(company)
    await this.db.insert(companiesTable).values(row).onConflictDoUpdate({
      target: companiesTable.id,
      set: row,
    })
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(companiesTable).where(
      and(eq(companiesTable.tenantId, tenantId), eq(companiesTable.id, id)),
    )
  }
}
