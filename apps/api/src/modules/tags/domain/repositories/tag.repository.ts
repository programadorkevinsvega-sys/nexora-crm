import { Tag } from '../entities/tag.entity'

export interface FindAllOptions {
  search?: string
  cursor?: string
  limit: number
}

export interface PaginatedTags {
  data: Tag[]
  nextCursor: string | null
}

export abstract class TagRepository {
  abstract create(tag: Tag): Promise<void>
  abstract findById(tenantId: string, id: string): Promise<Tag | null>
  abstract findAll(tenantId: string, options: FindAllOptions): Promise<PaginatedTags>
  abstract update(tag: Tag): Promise<void>
  abstract delete(tenantId: string, id: string): Promise<void>
}
