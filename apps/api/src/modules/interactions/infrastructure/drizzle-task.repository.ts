import { Injectable } from '@nestjs/common'
import { eq, and, asc, gt } from 'drizzle-orm'
import { getDb, tasks as tasksTable } from '@crm/database'
import { TaskRepository, TaskFilter, PaginatedTasks } from '../domain/repositories/task.repository'
import { Task } from '../domain/entities/task.entity'
import { TaskMapper } from './interactions.mapper'

@Injectable()
export class DrizzleTaskRepository extends TaskRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<Task | null> {
    const row = await this.db.query.tasks.findFirst({
      where: and(eq(tasksTable.tenantId, tenantId)!, eq(tasksTable.id, id)) as any,
    })
    return row ? TaskMapper.toDomain(row) : null
  }

  async list(tenantId: string, filter: TaskFilter): Promise<PaginatedTasks> {
    const conditions = [eq(tasksTable.tenantId, tenantId)]

    if (filter.cursor) conditions.push(gt(tasksTable.createdAt, new Date(filter.cursor)))
    if (filter.contactId) conditions.push(eq(tasksTable.contactId, filter.contactId))
    if (filter.companyId) conditions.push(eq(tasksTable.companyId, filter.companyId))
    if (filter.dealId) conditions.push(eq(tasksTable.dealId, filter.dealId))
    if (filter.assignedUserId) conditions.push(eq(tasksTable.assignedUserId, filter.assignedUserId))
    if (filter.isCompleted !== undefined) conditions.push(eq(tasksTable.isCompleted, filter.isCompleted))

    const rows = await this.db.query.tasks.findMany({
      where: and(...conditions.filter(Boolean)!) as any,
      limit: filter.limit + 1,
      orderBy: [asc(tasksTable.createdAt), asc(tasksTable.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map(TaskMapper.toDomain),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async save(task: Task): Promise<void> {
    const row = TaskMapper.toPersistence(task)
    await this.db.insert(tasksTable).values(row).onConflictDoUpdate({
      target: tasksTable.id,
      set: row,
    })
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(tasksTable).where(
      and(eq(tasksTable.tenantId, tenantId), eq(tasksTable.id, id)),
    )
  }
}
