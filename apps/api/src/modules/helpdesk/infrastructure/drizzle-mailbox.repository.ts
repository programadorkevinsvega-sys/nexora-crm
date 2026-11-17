import { Injectable } from '@nestjs/common'
import { eq, and, asc } from 'drizzle-orm'
import { getDb, helpdeskMailboxes as mailboxesTable } from '@crm/database'
import { MailboxRepository } from '../domain/repositories/mailbox.repository'
import { HelpdeskMailbox } from '../domain/entities/mailbox.entity'
import { MailboxMapper } from './mappers/mailbox.mapper'

@Injectable()
export class DrizzleMailboxRepository extends MailboxRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<HelpdeskMailbox | null> {
    const row = await this.db.query.helpdeskMailboxes.findFirst({
      where: and(eq(mailboxesTable.tenantId, tenantId)!, eq(mailboxesTable.id, id)) as any,
    })
    return row ? MailboxMapper.toDomain(row) : null
  }

  async list(tenantId: string): Promise<HelpdeskMailbox[]> {
    const rows = await this.db.query.helpdeskMailboxes.findMany({
      where: eq(mailboxesTable.tenantId, tenantId),
      orderBy: [asc(mailboxesTable.name)],
    })
    return rows.map(MailboxMapper.toDomain)
  }

  async save(mailbox: HelpdeskMailbox): Promise<void> {
    const row = MailboxMapper.toPersistence(mailbox)
    await this.db.insert(mailboxesTable).values(row).onConflictDoUpdate({
      target: mailboxesTable.id,
      set: row,
    })
  }
}
