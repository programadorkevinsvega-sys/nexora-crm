import { api, qs } from "../../api/api-client"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { TaskFilters } from "@/src/domain/crm/tasks/task.repository"
import type { Task, TaskCreateInput, TaskUpdateInput } from "@/src/domain/crm/tasks/task.entity"

export const ApiTaskRepository = {
  async list(filters: TaskFilters = {}, pagination?: { cursor?: string; limit?: number }): Promise<PaginatedResult<Task>> {
    const params = { ...filters, cursor: pagination?.cursor ?? undefined, limit: pagination?.limit ?? 20 }
    return api.get<PaginatedResult<Task>>(`/api/tasks${qs(params)}`)
  },
  async getById(id: string): Promise<Task> {
    return api.get<Task>(`/api/tasks/${id}`)
  },
  async create(data: TaskCreateInput): Promise<Task> {
    return api.post<Task>("/api/tasks", data)
  },
  async update(id: string, data: TaskUpdateInput): Promise<Task> {
    return api.put<Task>(`/api/tasks/${id}`, data)
  },
  async delete(id: string): Promise<void> {
    return api.delete(`/api/tasks/${id}`)
  },
}
