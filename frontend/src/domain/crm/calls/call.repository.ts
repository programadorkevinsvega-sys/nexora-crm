import type { Repository } from "../common/repositories/repository.interface"
import type { Call, CallCreateInput, CallUpdateInput } from "./call.entity"

export interface CallFilters {
  contactId?: string
  authorUserId?: string
  tenantId?: string
  search?: string
  cursor?: string
  limit?: number
}

export type CallRepository = Repository<Call, CallCreateInput, CallUpdateInput, CallFilters>
