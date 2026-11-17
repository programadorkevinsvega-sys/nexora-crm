import type { Repository } from "../common/repositories/repository.interface"
import type { Deal, DealCreateInput, DealUpdateInput } from "./deal.entity"

export interface DealFilters {
  pipelineId?: string
  stageId?: string
  status?: string
  ownerUserId?: string
  cursor?: string
  limit?: number
}

export interface IDealRepository extends Repository<Deal, DealCreateInput, DealUpdateInput, DealFilters> {
  moveToStage(id: string, stageId: string): Promise<Deal>
  win(id: string): Promise<Deal>
  lose(id: string, reason?: string): Promise<Deal>
}
