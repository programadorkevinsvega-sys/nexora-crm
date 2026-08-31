import { api, qs } from "../../api/api-client"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"

export interface Tag {
  id: string
  tenantId: string
  name: string
  color: string | null
  createdAt: string
  updatedAt: string
}

export interface TagCreateInput {
  tenantId: string
  name: string
  color?: string | null
}

export interface TagUpdateInput {
  name?: string
  color?: string | null
}

export const ApiTagRepository = {
  async list(filters: { tenantId?: string; search?: string; cursor?: string; limit?: number } = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Tag>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Tag>>(`/api/tags${qs(params)}`)
  },
  async getById(id: string): Promise<Tag> {
    return api.get<Tag>(`/api/tags/${id}`)
  },
  async create(data: TagCreateInput): Promise<Tag> {
    return api.post<Tag>("/api/tags", data)
  },
  async update(id: string, data: TagUpdateInput): Promise<Tag> {
    return api.put<Tag>(`/api/tags/${id}`, data)
  },
  async delete(id: string): Promise<void> {
    return api.delete(`/api/tags/${id}`)
  },
}
