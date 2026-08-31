import { LifeEvent } from '../entities/life-event.entity'
import { ContactGift } from '../entities/contact-gift.entity'
import { ContactDebt } from '../entities/contact-debt.entity'
import { ContactReminder } from '../entities/contact-reminder.entity'
import { ContactPet } from '../entities/contact-pet.entity'
import { RelationshipType } from '../entities/relationship-type.entity'

export abstract class PersonalCrmRepository {
  abstract saveLifeEvent(event: LifeEvent): Promise<void>
  abstract listLifeEvents(tenantId: string, contactId?: string): Promise<LifeEvent[]>

  abstract saveGift(gift: ContactGift): Promise<void>
  abstract listGifts(tenantId: string, contactId?: string): Promise<ContactGift[]>

  abstract saveDebt(debt: ContactDebt): Promise<void>
  abstract findDebtById(tenantId: string, id: string): Promise<ContactDebt | null>
  abstract listDebts(tenantId: string, contactId?: string): Promise<ContactDebt[]>

  abstract saveReminder(reminder: ContactReminder): Promise<void>
  abstract findReminderById(tenantId: string, id: string): Promise<ContactReminder | null>
  abstract listReminders(tenantId: string, contactId?: string): Promise<ContactReminder[]>

  abstract savePet(pet: ContactPet): Promise<void>
  abstract listPets(tenantId: string, contactId?: string): Promise<ContactPet[]>

  abstract findRelationshipTypeById(tenantId: string, id: string): Promise<RelationshipType | null>
}
