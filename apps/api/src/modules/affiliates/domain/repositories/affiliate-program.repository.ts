import { AffiliateProgram } from '../entities/affiliate-program.entity'

export interface ProgramFilter {
  search?: string
  isActive?: boolean
  cursor?: string
  limit: number
}

export interface PaginatedPrograms {
  data: AffiliateProgram[]
  nextCursor: string | null
}

export abstract class AffiliateProgramRepository {
  abstract findById(tenantId: string, id: string): Promise<AffiliateProgram | null>
  abstract findByName(tenantId: string, name: string): Promise<AffiliateProgram | null>
  abstract list(tenantId: string, filter: ProgramFilter): Promise<PaginatedPrograms>
  abstract save(program: AffiliateProgram): Promise<void>
}
