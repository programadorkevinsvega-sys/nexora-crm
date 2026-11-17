import { Injectable } from '@nestjs/common'
import { eq, and, asc, gt } from 'drizzle-orm'
import { getDb, notes as notesTable } from '@crm/database'
import { NoteRepository, NoteFilter, PaginatedNotes } from '../domain/repositories/note.repository'
import { Note } from '../domain/entities/note.entity'
import { NoteMapper } from './interactions.mapper'

@Injectable()
export class DrizzleNoteRepository extends NoteRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<Note | null> {
    const row = await this.db.query.notes.findFirst({
      where: and(eq(notesTable.tenantId, tenantId)!, eq(notesTable.id, id)) as any,
    })
    return row ? NoteMapper.toDomain(row) : null
  }

  async list(tenantId: string, filter: NoteFilter): Promise<PaginatedNotes> {
    const conditions = [eq(notesTable.tenantId, tenantId)]

    if (filter.cursor) conditions.push(gt(notesTable.createdAt, new Date(filter.cursor)))
    if (filter.contactId) conditions.push(eq(notesTable.contactId, filter.contactId))
    if (filter.companyId) conditions.push(eq(notesTable.companyId, filter.companyId))
    if (filter.dealId) conditions.push(eq(notesTable.dealId, filter.dealId))

    const rows = await this.db.query.notes.findMany({
      where: and(...conditions.filter(Boolean)!) as any,
      limit: filter.limit + 1,
      orderBy: [asc(notesTable.createdAt), asc(notesTable.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map(NoteMapper.toDomain),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async save(note: Note): Promise<void> {
    const row = NoteMapper.toPersistence(note)
    await this.db.insert(notesTable).values(row).onConflictDoUpdate({
      target: notesTable.id,
      set: row,
    })
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(notesTable).where(
      and(eq(notesTable.tenantId, tenantId), eq(notesTable.id, id)),
    )
  }
}
