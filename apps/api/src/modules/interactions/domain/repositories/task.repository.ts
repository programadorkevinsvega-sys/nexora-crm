import { Task } from '../entities/task.entity'

export interface TaskFilter {
  contactId?: string
  companyId?: string
  dealId?: string
  assignedUserId?: string
  isCompleted?: boolean
  cursor?: string
  limit: number
}

export interface PaginatedTasks {
  data: Task[]
  nextCursor: string | null
}

export abstract class TaskRepository {
  abstract findById(tenantId: string, id: string): Promise<Task | null>
  abstract list(tenantId: string, filter: TaskFilter): Promise<PaginatedTasks>
  abstract save(task: Task): Promise<void>
  abstract delete(tenantId: string, id: string): Promise<void>
}
