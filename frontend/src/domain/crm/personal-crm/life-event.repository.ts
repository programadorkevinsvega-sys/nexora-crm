import type { PaginatedResult } from "../common/results/paginated-result"
import type { Pagination } from "../common/value-objects/Pagination"
import type { LifeEvent, LifeEventCreateInput } from "./life-event.entity"

export interface LifeEventRepository {
  listByContactId(contactId: string, pagination?: Pagination): Promise<PaginatedResult<LifeEvent>>
  create(data: LifeEventCreateInput): Promise<LifeEvent>
}
