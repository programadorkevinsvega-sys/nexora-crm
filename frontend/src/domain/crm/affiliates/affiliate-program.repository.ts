import type { Repository } from "../common/repositories/repository.interface"
import type { AffiliateProgram, ProgramCreateInput, ProgramUpdateInput } from "./affiliate-program.entity"

export interface AffiliateProgramFilters {
  isActive?: boolean
  tenantId?: string
  search?: string
  cursor?: string
  limit?: number
}

export type AffiliateProgramRepository = Repository<AffiliateProgram, ProgramCreateInput, ProgramUpdateInput, AffiliateProgramFilters>
