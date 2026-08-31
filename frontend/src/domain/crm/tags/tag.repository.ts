import type { Repository } from "../common/repositories/repository.interface"
import type { Tag, TagCreateInput, TagUpdateInput } from "./tag.entity"

export interface TagFilters {
  search?: string
}

export type TagRepository = Repository<Tag, TagCreateInput, TagUpdateInput, TagFilters>
