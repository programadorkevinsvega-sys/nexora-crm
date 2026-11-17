import { Injectable } from '@nestjs/common'
import { eq, ilike, and, asc, or, gt, sql } from 'drizzle-orm'
import { getDb, contacts as contactsTable } from '@crm/database'
import { IContactRepository, ContactFilter, PaginatedContacts } from '../../../../domain/repositories/IContactRepository'
import { Contact } from '../../../../domain/entities/Contact'
import { ContactPersistenceMapper } from '../mappers/ContactPersistenceMapper'

@Injectable()
export class DrizzleContactRepository implements IContactRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<Contact | null> {
    const row = await this.db.query.contacts.findFirst({
      where: and(eq(contactsTable.tenantId, tenantId)!, eq(contactsTable.id, id)) as any,
    })
    return row ? ContactPersistenceMapper.toDomain(row as any) : null
  }

  async findByEmail(tenantId: string, email: string): Promise<Contact | null> {
    const row = await this.db.query.contacts.findFirst({
      where: and(eq(contactsTable.tenantId, tenantId)!, eq(contactsTable.email, email)) as any,
    })
    return row ? ContactPersistenceMapper.toDomain(row as any) : null
  }

  async list(tenantId: string, filter: ContactFilter): Promise<PaginatedContacts> {
    const conditions = [eq(contactsTable.tenantId, tenantId)]

    if (filter.cursor) conditions.push(gt(contactsTable.createdAt, new Date(filter.cursor)))
    if (filter.search) {
      conditions.push(
        or(
          ilike(contactsTable.firstName, `%${filter.search}%`),
          ilike(contactsTable.lastName, `%${filter.search}%`),
          ilike(contactsTable.email, `%${filter.search}%`),
        )!,
      )
    }
    if (filter.leadStatus) conditions.push(eq(contactsTable.leadStatus, filter.leadStatus))
    if (filter.companyId) conditions.push(eq(contactsTable.companyId, filter.companyId))
    if (filter.isStarred !== undefined) conditions.push(eq(contactsTable.isStarred, filter.isStarred))

    if (filter.assignedUserId) {
      conditions.push(
        sql`(${contactsTable.metadata}->>'assignedUserId' = ${filter.assignedUserId} OR ${contactsTable.metadata}->>'creatorId' = ${filter.assignedUserId} OR ${contactsTable.metadata}->>'ownerId' = ${filter.assignedUserId})` as any,
      )
    } else if (filter.visibleUserIds && filter.visibleUserIds.length > 0) {
      const userList = filter.visibleUserIds.map((id) => `'${id}'`).join(',')
      conditions.push(
        sql`(${contactsTable.metadata}->>'assignedUserId' IN (${sql.raw(userList)}) OR ${contactsTable.metadata}->>'assignedUserId' IS NULL)` as any,
      )
    }

    const rows = await this.db.query.contacts.findMany({
      where: and(...conditions.filter(Boolean)!) as any,
      limit: filter.limit + 1,
      orderBy: [asc(contactsTable.createdAt), asc(contactsTable.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map(r => ContactPersistenceMapper.toDomain(r as any)),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async save(contact: Contact): Promise<void> {
    const row = ContactPersistenceMapper.toPersistence(contact)
    await this.db.insert(contactsTable).values(row as any).onConflictDoUpdate({
      target: contactsTable.id,
      set: row as any,
    })
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(contactsTable).where(
      and(eq(contactsTable.tenantId, tenantId), eq(contactsTable.id, id)),
    )
  }
}
