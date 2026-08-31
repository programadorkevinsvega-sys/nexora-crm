import type { PaginatedResult } from "../results/paginated-result"
import type { Pagination } from "../value-objects/Pagination"

export interface Repository<T, TCreate, TUpdate, TFilters = Record<string, unknown>> {
  list(filters?: TFilters, pagination?: Pagination): Promise<PaginatedResult<T>>
  getById(id: string): Promise<T | null>
  create(data: TCreate): Promise<T>
  update(id: string, data: TUpdate): Promise<T>
  delete(id: string): Promise<void>
}
