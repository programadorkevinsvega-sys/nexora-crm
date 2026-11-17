export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
}

export interface CursorParams {
  cursor?: string
  limit: number
}

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}
