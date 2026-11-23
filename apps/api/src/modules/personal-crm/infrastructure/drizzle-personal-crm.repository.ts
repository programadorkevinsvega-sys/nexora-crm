import { Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import {
  getDb,
  lifeEvents as lifeEventsTable,
  contactGifts as contactGiftsTable,
  contactDebts as contactDebtsTable,
  contactReminders as contactRemindersTable,
  contactPets as contactPetsTable,
} from '@crm/database'
import { PersonalCrmRepository } from '../domain/repositories/personal-crm.repository'
import { LifeEvent } from '../domain/entities/life-event.entity'
import { ContactGift } from '../domain/entities/contact-gift.entity'
import { ContactDebt } from '../domain/entities/contact-debt.entity'
import { ContactReminder } from '../domain/entities/contact-reminder.entity'
import { ContactPet } from '../domain/entities/contact-pet.entity'
import { RelationshipType } from '../domain/entities/relationship-type.entity'
import { PersonalCrmMapper } from './personal-crm.mapper'

@Injectable()
export class DrizzlePersonalCrmRepository extends PersonalCrmRepository {
  private get db() {
    return getDb()
  }

  async saveLifeEvent(event: LifeEvent): Promise<void> {
    const row = PersonalCrmMapper.lifeEventToPersistence(event)
    await this.db.insert(lifeEventsTable).values(row).onConflictDoUpdate({
      target: lifeEventsTable.id,
      set: row,
    })
  }

  async listLifeEvents(tenantId: string, contactId?: string): Promise<LifeEvent[]> {
    const conditions = [eq(lifeEventsTable.tenantId, tenantId)]
    if (contactId && contactId.trim()) conditions.push(eq(lifeEventsTable.contactId, contactId))
    const rows = await this.db.query.lifeEvents.findMany({
      where: and(...conditions),
      orderBy: (t, { desc }) => [desc(t.happenedAt)],
    })
    return rows.map(PersonalCrmMapper.lifeEventToDomain)
  }

  async saveGift(gift: ContactGift): Promise<void> {
    const row = PersonalCrmMapper.giftToPersistence(gift)
    await this.db.insert(contactGiftsTable).values(row).onConflictDoUpdate({
      target: contactGiftsTable.id,
      set: row,
    })
  }

  async listGifts(tenantId: string, contactId?: string): Promise<ContactGift[]> {
    const conditions = [eq(contactGiftsTable.tenantId, tenantId)]
    if (contactId && contactId.trim()) conditions.push(eq(contactGiftsTable.contactId, contactId))
    const rows = await this.db.query.contactGifts.findMany({
      where: and(...conditions) as any,
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    })
    return rows.map(PersonalCrmMapper.giftToDomain)
  }

  async saveDebt(debt: ContactDebt): Promise<void> {
    const row = PersonalCrmMapper.debtToPersistence(debt)
    await this.db.insert(contactDebtsTable).values(row).onConflictDoUpdate({
      target: contactDebtsTable.id,
      set: row,
    })
  }

  async findDebtById(tenantId: string, id: string): Promise<ContactDebt | null> {
    const row = await this.db.query.contactDebts.findFirst({
      where: and(eq(contactDebtsTable.tenantId, tenantId), eq(contactDebtsTable.id, id)),
    })
    return row ? PersonalCrmMapper.debtToDomain(row) : null
  }

  async listDebts(tenantId: string, contactId?: string): Promise<ContactDebt[]> {
    const conditions = [eq(contactDebtsTable.tenantId, tenantId)]
    if (contactId && contactId.trim()) conditions.push(eq(contactDebtsTable.contactId, contactId))
    const rows = await this.db.query.contactDebts.findMany({
      where: and(...conditions) as any,
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    })
    return rows.map(PersonalCrmMapper.debtToDomain)
  }

  async saveReminder(reminder: ContactReminder): Promise<void> {
    const row = PersonalCrmMapper.reminderToPersistence(reminder)
    await this.db.insert(contactRemindersTable).values(row).onConflictDoUpdate({
      target: contactRemindersTable.id,
      set: row,
    })
  }

  async findReminderById(tenantId: string, id: string): Promise<ContactReminder | null> {
    const row = await this.db.query.contactReminders.findFirst({
      where: and(eq(contactRemindersTable.tenantId, tenantId), eq(contactRemindersTable.id, id)),
    })
    return row ? PersonalCrmMapper.reminderToDomain(row) : null
  }

  async listReminders(tenantId: string, contactId?: string): Promise<ContactReminder[]> {
    const conditions = [eq(contactRemindersTable.tenantId, tenantId)]
    if (contactId && contactId.trim()) conditions.push(eq(contactRemindersTable.contactId, contactId))
    const rows = await this.db.query.contactReminders.findMany({
      where: and(...conditions) as any,
      orderBy: (t, { asc }) => [asc(t.nextDueDate)],
    })
    return rows.map(PersonalCrmMapper.reminderToDomain)
  }

  async savePet(pet: ContactPet): Promise<void> {
    const row = PersonalCrmMapper.petToPersistence(pet)
    await this.db.insert(contactPetsTable).values(row).onConflictDoUpdate({
      target: contactPetsTable.id,
      set: row,
    })
  }

  async listPets(tenantId: string, contactId?: string): Promise<ContactPet[]> {
    const conditions = [eq(contactPetsTable.tenantId, tenantId)]
    if (contactId && contactId.trim()) conditions.push(eq(contactPetsTable.contactId, contactId))
    const rows = await this.db.query.contactPets.findMany({
      where: and(...conditions) as any,
      orderBy: (t, { asc }) => [asc(t.name)],
    })
    return rows.map(PersonalCrmMapper.petToDomain)
  }


  async findRelationshipTypeById(_tenantId: string, _id: string): Promise<RelationshipType | null> {
    return null
  }
}
