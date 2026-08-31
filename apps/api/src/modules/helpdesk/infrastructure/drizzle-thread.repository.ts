import { Injectable } from '@nestjs/common'
import { eq, and, asc } from 'drizzle-orm'
import { getDb, helpdeskThreads as threadsTable } from '@crm/database'
import { ThreadRepository } from '../domain/repositories/thread.repository'
import { HelpdeskThread } from '../domain/entities/thread.entity'
import { ThreadMapper } from './mappers/thread.mapper'

@Injectable()
export class DrizzleThreadRepository extends ThreadRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<HelpdeskThread | null> {
    const row = await this.db.query.helpdeskThreads.findFirst({
      where: and(eq(threadsTable.tenantId, tenantId)!, eq(threadsTable.id, id)) as any,
    })
    return row ? ThreadMapper.toDomain(row) : null
  }

  async findByConversationId(tenantId: string, conversationId: string): Promise<HelpdeskThread[]> {
    const rows = await this.db.query.helpdeskThreads.findMany({
      where: and(eq(threadsTable.tenantId, tenantId)!, eq(threadsTable.conversationId, conversationId)) as any,
      orderBy: [asc(threadsTable.createdAt), asc(threadsTable.id)],
    })
    return rows.map(ThreadMapper.toDomain)
  }

  async save(thread: HelpdeskThread): Promise<void> {
    const row = ThreadMapper.toPersistence(thread)
    await this.db.insert(threadsTable).values(row).onConflictDoUpdate({
      target: threadsTable.id,
      set: row,
    })
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(threadsTable).where(
      and(eq(threadsTable.tenantId, tenantId), eq(threadsTable.id, id)),
    )
  }
}
