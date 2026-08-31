import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { PaginatedResult } from "@/src/domain/crm/common/results/paginated-result"
import type { Pagination } from "@/src/domain/crm/common/value-objects/Pagination"
import type { TaskRepository, TaskFilters } from "@/src/domain/crm/tasks/task.repository"
import type { Task } from "@/src/domain/crm/tasks/task.entity"

export class ListTasksUseCase {
  constructor(private repository: TaskRepository) {}

  async execute(filters?: TaskFilters, pagination?: Pagination): Promise<Result<PaginatedResult<Task>>> {
    try {
      const result = await this.repository.list(filters, pagination)
      return success(result)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
