import { api, qs } from "../../api/api-client"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"

export interface PipelineStage {
  id: string
  pipelineId: string
  name: string
  order: number
  color: string | null
  probabilityPercent: number | null
}

export interface Pipeline {
  id: string
  tenantId: string
  name: string
  description: string | null
  stages: PipelineStage[]
  createdAt: string
  updatedAt: string
}

export interface PipelineCreateInput {
  tenantId: string
  name: string
  description?: string | null
}

export interface PipelineUpdateInput {
  name?: string
  description?: string | null
}

export interface PipelineFilters {
  tenantId?: string
  search?: string
  cursor?: string
  limit?: number
}

export const ApiPipelineRepository = {
  async list(filters: PipelineFilters = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Pipeline>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    const response = await api.get<PaginatedResult<Pipeline> | Pipeline[] | null>(`/api/pipelines${qs(params)}`)

    if (Array.isArray(response)) {
      return {
        data: response,
        nextCursor: null,
      }
    }

    if (response && Array.isArray(response.data)) {
      return {
        data: response.data,
        nextCursor: response.nextCursor ?? null,
      }
    }

    return {
      data: [],
      nextCursor: null,
    }
  },
  async getById(id: string): Promise<Pipeline> {
    return api.get<Pipeline>(`/api/pipelines/${id}`)
  },
  async create(data: PipelineCreateInput): Promise<Pipeline> {
    return api.post<Pipeline>("/api/pipelines", data)
  },
  async update(id: string, data: PipelineUpdateInput): Promise<Pipeline> {
    return api.put<Pipeline>(`/api/pipelines/${id}`, data)
  },
  async delete(id: string): Promise<void> {
    return api.delete(`/api/pipelines/${id}`)
  },
  async getBoard(id: string): Promise<Pipeline> {
    return api.get<Pipeline>(`/api/pipelines/${id}`)
  },
  async createStage(pipelineId: string, data: { name: string; order?: number; color?: string | null; probability?: number | null }): Promise<PipelineStage> {
    return api.post<PipelineStage>(`/api/pipelines/${pipelineId}/stages`, data)
  },
  async reorderStages(pipelineId: string, stageIds: string[]): Promise<PipelineStage[]> {
    return api.put<PipelineStage[]>(`/api/pipelines/${pipelineId}/stages/reorder`, { stageIds })
  },
}
