import type { Repository } from "../common/repositories/repository.interface"
import type { SalesTeam, SalesTeamCreateInput, SalesTeamUpdateInput } from "./sales-team.entity"

export interface SalesTeamFilters {
  isActive?: boolean
  tenantId?: string
  search?: string
  cursor?: string
  limit?: number
}

export type SalesTeamRepository = Repository<SalesTeam, SalesTeamCreateInput, SalesTeamUpdateInput, SalesTeamFilters>
