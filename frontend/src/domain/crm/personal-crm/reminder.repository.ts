import type { PaginatedResult } from "../common/results/paginated-result"
import type { Pagination } from "../common/value-objects/Pagination"
import type { Reminder, ReminderCreateInput } from "./reminder.entity"

export interface ReminderRepository {
  listByContactId(contactId: string, pagination?: Pagination): Promise<PaginatedResult<Reminder>>
  create(data: ReminderCreateInput): Promise<Reminder>
  toggle(id: string): Promise<Reminder>
}
