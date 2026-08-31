import type { PaginatedResult } from "../common/results/paginated-result"
import type { Pagination } from "../common/value-objects/Pagination"
import type { Pet, PetCreateInput } from "./pet.entity"

export interface PetRepository {
  listByContactId(contactId: string, pagination?: Pagination): Promise<PaginatedResult<Pet>>
  create(data: PetCreateInput): Promise<Pet>
}
