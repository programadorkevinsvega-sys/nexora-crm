import { LifeEvent } from '../domain/entities/life-event.entity'
import { ContactGift, GiftDirection, GiftStatus } from '../domain/entities/contact-gift.entity'
import { ContactDebt, DebtDirection, DebtStatus } from '../domain/entities/contact-debt.entity'
import { ContactReminder, FrequencyType } from '../domain/entities/contact-reminder.entity'
import { ContactPet } from '../domain/entities/contact-pet.entity'

type LifeEventRow = {
  id: string; tenantId: string; contactId: string; eventType: string
  name: string; description: string | null; happenedAt: string
  isYearlyRecurring: boolean; createdAt: Date; updatedAt: Date
}

type GiftRow = {
  id: string; tenantId: string; contactId: string
  direction: string; name: string; description: string | null
  url: string | null; estimatedValue: string | null; status: string
  dateGivenOrReceived: string | null; createdAt: Date; updatedAt: Date
}

type DebtRow = {
  id: string; tenantId: string; contactId: string
  direction: string; amount: string; reason: string; status: string | null
  dueDate: string | null; createdAt: Date; updatedAt: Date
}

type ReminderRow = {
  id: string; tenantId: string; contactId: string
  title: string; description: string | null
  frequencyType: string; frequencyInterval: number | null
  nextDueDate: Date; isActive: boolean | null; createdAt: Date; updatedAt: Date
}

type PetRow = {
  id: string; tenantId: string; contactId: string
  petCategory: string; name: string; breed: string | null
  createdAt: Date; updatedAt: Date
}

export class PersonalCrmMapper {
  static lifeEventToDomain(row: LifeEventRow): LifeEvent {
    return new LifeEvent(
      row.id, row.tenantId, row.contactId, row.eventType, row.name,
      row.description, row.happenedAt, row.isYearlyRecurring, row.createdAt, row.updatedAt,
    )
  }

  static lifeEventToPersistence(event: LifeEvent): LifeEventRow {
    return {
      id: event.id, tenantId: event.tenantId, contactId: event.contactId,
      eventType: event.eventType, name: event.name, description: event.description,
      happenedAt: event.happenedAt, isYearlyRecurring: event.isYearlyRecurring,
      createdAt: event.createdAt, updatedAt: event.updatedAt,
    }
  }

  static lifeEventToResponse(event: LifeEvent) {
    return {
      id: event.id, contactId: event.contactId, eventType: event.eventType,
      name: event.name, description: event.description, happenedAt: event.happenedAt,
      isYearlyRecurring: event.isYearlyRecurring,
      createdAt: event.createdAt.toISOString(), updatedAt: event.updatedAt.toISOString(),
    }
  }

  static giftToDomain(row: GiftRow): ContactGift {
    return new ContactGift(
      row.id, row.tenantId, row.contactId, row.direction as GiftDirection, row.name,
      row.description, row.url,
      row.estimatedValue ? Number(row.estimatedValue) : null,
      (row.status ?? "UNPAID") as GiftStatus, row.dateGivenOrReceived, row.createdAt, row.updatedAt,
    )
  }

  static giftToPersistence(gift: ContactGift): GiftRow {
    return {
      id: gift.id, tenantId: gift.tenantId, contactId: gift.contactId,
      direction: gift.direction, name: gift.name, description: gift.description,
      url: gift.url, estimatedValue: gift.estimatedValue?.toString() ?? null,
      status: gift.status, dateGivenOrReceived: gift.dateGivenOrReceived,
      createdAt: gift.createdAt, updatedAt: gift.updatedAt,
    }
  }

  static giftToResponse(gift: ContactGift) {
    return {
      id: gift.id, contactId: gift.contactId, direction: gift.direction,
      name: gift.name, description: gift.description, url: gift.url,
      estimatedValue: gift.estimatedValue, status: gift.status,
      dateGivenOrReceived: gift.dateGivenOrReceived,
      createdAt: gift.createdAt.toISOString(), updatedAt: gift.updatedAt.toISOString(),
    }
  }

  static debtToDomain(row: DebtRow): ContactDebt {
    return new ContactDebt(
      row.id, row.tenantId, row.contactId, row.direction as DebtDirection,
      Number(row.amount), row.reason, (row.status ?? "UNPAID") as DebtStatus,
      row.dueDate, row.createdAt, row.updatedAt,
    )
  }

  static debtToPersistence(debt: ContactDebt): DebtRow {
    return {
      id: debt.id, tenantId: debt.tenantId, contactId: debt.contactId,
      direction: debt.direction, amount: debt.amount.toString(), reason: debt.reason,
      status: debt.status, dueDate: debt.dueDate,
      createdAt: debt.createdAt, updatedAt: debt.updatedAt,
    }
  }

  static debtToResponse(debt: ContactDebt) {
    return {
      id: debt.id, contactId: debt.contactId, direction: debt.direction,
      amount: debt.amount, reason: debt.reason, status: debt.status,
      dueDate: debt.dueDate,
      createdAt: debt.createdAt.toISOString(), updatedAt: debt.updatedAt.toISOString(),
    }
  }

  static reminderToDomain(row: ReminderRow): ContactReminder {
    return new ContactReminder(
      row.id, row.tenantId, row.contactId, row.title, row.description,
      row.frequencyType as FrequencyType, row.frequencyInterval ?? 1,
      row.nextDueDate, row.isActive ?? true, row.createdAt, row.updatedAt,
    )
  }

  static reminderToPersistence(reminder: ContactReminder): ReminderRow {
    return {
      id: reminder.id, tenantId: reminder.tenantId, contactId: reminder.contactId,
      title: reminder.title, description: reminder.description,
      frequencyType: reminder.frequencyType, frequencyInterval: reminder.frequencyInterval,
      nextDueDate: reminder.nextDueDate, isActive: reminder.isActive,
      createdAt: reminder.createdAt, updatedAt: reminder.updatedAt,
    }
  }

  static reminderToResponse(reminder: ContactReminder) {
    return {
      id: reminder.id, contactId: reminder.contactId, title: reminder.title,
      description: reminder.description, frequencyType: reminder.frequencyType,
      frequencyInterval: reminder.frequencyInterval,
      nextDueDate: reminder.nextDueDate.toISOString(), isActive: reminder.isActive,
      createdAt: reminder.createdAt.toISOString(), updatedAt: reminder.updatedAt.toISOString(),
    }
  }

  static petToDomain(row: PetRow): ContactPet {
    return new ContactPet(
      row.id, row.tenantId, row.contactId, row.petCategory, row.name, row.breed,
      row.createdAt, row.updatedAt,
    )
  }

  static petToPersistence(pet: ContactPet): PetRow {
    return {
      id: pet.id, tenantId: pet.tenantId, contactId: pet.contactId,
      petCategory: pet.petCategory, name: pet.name, breed: pet.breed,
      createdAt: pet.createdAt, updatedAt: pet.updatedAt,
    }
  }

  static petToResponse(pet: ContactPet) {
    return {
      id: pet.id, contactId: pet.contactId, petCategory: pet.petCategory,
      name: pet.name, breed: pet.breed,
      createdAt: pet.createdAt.toISOString(), updatedAt: pet.updatedAt.toISOString(),
    }
  }
}
