import { Deal } from '../entities/deal.entity'

export interface DealFilter {
  pipelineId?: string
  stageId?: string
  status?: string
  contactId?: string
  companyId?: string
  assignedUserId?: string
  requestingUserId?: string
  requestingUserRole?: string
  search?: string
}

export abstract class DealRepository {
  abstract findById(tenantId: string, id: string): Promise<Deal | null>
  abstract list(tenantId: string, filter: DealFilter): Promise<Deal[]>
  abstract save(deal: Deal): Promise<void>
  abstract delete(tenantId: string, id: string): Promise<void>
}
