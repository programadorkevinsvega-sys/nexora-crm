import type { PaginatedResult } from "../common/results/paginated-result"
import type { Pagination } from "../common/value-objects/Pagination"
import type { Gift, GiftCreateInput } from "./gift.entity"

export interface GiftRepository {
  listByContactId(contactId: string, pagination?: Pagination): Promise<PaginatedResult<Gift>>
  create(data: GiftCreateInput): Promise<Gift>
}
