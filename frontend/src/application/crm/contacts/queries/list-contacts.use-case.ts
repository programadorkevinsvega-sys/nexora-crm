import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { IContactRepository, ContactFilters } from "@/src/domain/crm/contacts/contact.repository"
import type { Contact } from "@/src/domain/crm/contacts/contact.entity"

export class ListContactsUseCase {
  constructor(private repository: IContactRepository) {}

  async execute(filters?: ContactFilters, pagination?: Pagination): Promise<Result<PaginatedResult<Contact>>> {
    try {
      const result = await this.repository.list(filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
