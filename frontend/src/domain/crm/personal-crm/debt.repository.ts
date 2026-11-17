import type { PaginatedResult } from "../common/results/paginated-result"
import type { Pagination } from "../common/value-objects/Pagination"
import type { Debt, DebtCreateInput } from "./debt.entity"

export interface DebtRepository {
  listByContactId(contactId: string, pagination?: Pagination): Promise<PaginatedResult<Debt>>
  create(data: DebtCreateInput): Promise<Debt>
  settle(id: string): Promise<Debt>
}
