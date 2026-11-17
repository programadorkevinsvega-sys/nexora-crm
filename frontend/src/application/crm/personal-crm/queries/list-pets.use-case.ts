import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { PetRepository } from "@/src/domain/crm/personal-crm/pet.repository"
import type { Pet } from "@/src/domain/crm/personal-crm/pet.entity"

export class ListPetsUseCase {
  constructor(private repository: PetRepository) {}

  async execute(contactId: string, pagination?: Pagination): Promise<Result<PaginatedResult<Pet>>> {
    try {
      const result = await this.repository.listByContactId(contactId, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
