import { Injectable } from '@nestjs/common'
import { eq, ilike, and, asc, or, gt, sql, SQL } from 'drizzle-orm'
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
      where: and(eq(contactsTable.tenantId, tenantId), eq(contactsTable.id, id)),
    })
    return row ? ContactPersistenceMapper.toDomain(row) : null
  }

  async findByEmail(tenantId: string, email: string): Promise<Contact | null> {
    const row = await this.db.query.contacts.findFirst({
      where: and(eq(contactsTable.tenantId, tenantId), eq(contactsTable.email, email)),
    })
    return row ? ContactPersistenceMapper.toDomain(row) : null
  }

  async list(tenantId: string, filter: ContactFilter): Promise<PaginatedContacts> {
    const conditions: SQL[] = [eq(contactsTable.tenantId, tenantId)]

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
        sql`(${contactsTable.metadata}->>'assignedUserId' = ${filter.assignedUserId} OR ${contactsTable.metadata}->>'creatorId' = ${filter.assignedUserId} OR ${contactsTable.metadata}->>'ownerId' = ${filter.assignedUserId})`,
      )
    } else if (filter.visibleUserIds && filter.visibleUserIds.length > 0) {
      const userList = sql.join(filter.visibleUserIds.map((id) => sql`${id}`), sql`, `)
      conditions.push(
        sql`(${contactsTable.metadata}->>'assignedUserId' IN (${userList}) OR ${contactsTable.metadata}->>'assignedUserId' IS NULL)`,
      )
    }

    const rows = await this.db.query.contacts.findMany({
      where: and(...conditions),
      limit: filter.limit + 1,
      orderBy: [asc(contactsTable.createdAt), asc(contactsTable.id)],
    })

    const hasMore = rows.length > filter.limit
    const data = hasMore ? rows.slice(0, filter.limit) : rows

    return {
      data: data.map((row) => ContactPersistenceMapper.toDomain(row)),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async save(contact: Contact): Promise<void> {
    const row = ContactPersistenceMapper.toPersistence(contact)
    await this.db.insert(contactsTable).values(row).onConflictDoUpdate({
      target: contactsTable.id,
      set: row,
    })
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(contactsTable).where(
      and(eq(contactsTable.tenantId, tenantId), eq(contactsTable.id, id)),
    )
  }
}
