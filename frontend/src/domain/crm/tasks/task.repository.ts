import type { Repository } from "../common/repositories/repository.interface"
import type { Task, TaskCreateInput, TaskUpdateInput } from "./task.entity"

export interface TaskFilters {
  contactId?: string
  companyId?: string
  dealId?: string
  assignedUserId?: string
  isCompleted?: boolean
  search?: string
  cursor?: string
  limit?: number
}

export type TaskRepository = Repository<Task, TaskCreateInput, TaskUpdateInput, TaskFilters>
