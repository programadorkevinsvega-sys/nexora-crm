import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { TaskRepository } from "@/src/domain/crm/tasks/task.repository"
import type { Task, TaskCreateInput } from "@/src/domain/crm/tasks/task.entity"

export class CreateTaskUseCase {
  constructor(private repository: TaskRepository) {}

  async execute(data: TaskCreateInput): Promise<Result<Task>> {
    try {
      const task = await this.repository.create(data)
      return success(task)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
