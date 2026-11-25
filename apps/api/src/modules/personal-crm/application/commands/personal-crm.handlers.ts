import { Injectable } from '@nestjs/common'
import { PersonalCrmRepository } from '../../domain/repositories/personal-crm.repository'
import { LifeEvent } from '../../domain/entities/life-event.entity'
import { ContactGift } from '../../domain/entities/contact-gift.entity'
import { ContactDebt } from '../../domain/entities/contact-debt.entity'
import { ContactReminder } from '../../domain/entities/contact-reminder.entity'
import { ContactPet } from '../../domain/entities/contact-pet.entity'
import {
  CreateLifeEventCommand,
  CreateGiftCommand,
  CreateDebtCommand,
  SettleDebtCommand,
  CreateReminderCommand,
  ToggleReminderCommand,
  AddPetCommand,
} from './personal-crm.commands'
import {
  LifeEventCreatedEvent,
  GiftGivenEvent,
  DebtRecordedEvent,
  DebtSettledEvent,
  ReminderCreatedEvent,
  PetAddedEvent,
} from '../../domain/events/personal-crm.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { NotFoundError } from '@crm/shared'

@Injectable()
export class CreateLifeEventHandler {
  constructor(
    private readonly repo: PersonalCrmRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateLifeEventCommand): Promise<{ id: string }> {
    const event = LifeEvent.create({
      tenantId: command.tenantId,
      contactId: command.contactId,
      eventType: command.eventType,
      name: command.name,
      description: command.description,
      happenedAt: command.happenedAt ?? new Date().toISOString().split('T')[0],
      isYearlyRecurring: command.isYearlyRecurring,
    })

    await this.repo.saveLifeEvent(event)
    await this.outbox.publish(new LifeEventCreatedEvent(event.id, event.contactId, event.eventType, event.name))

    return { id: event.id }
  }
}

@Injectable()
export class CreateGiftHandler {
  constructor(
    private readonly repo: PersonalCrmRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateGiftCommand): Promise<{ id: string }> {
    const gift = ContactGift.create({
      tenantId: command.tenantId,
      contactId: command.contactId,
      direction: command.direction,
      name: command.name,
      description: command.description,
      url: command.url,
      estimatedValue: command.estimatedValue,
      status: command.status,
      dateGivenOrReceived: command.dateGivenOrReceived,
    })

    await this.repo.saveGift(gift)
    await this.outbox.publish(new GiftGivenEvent(gift.id, gift.contactId, gift.name))

    return { id: gift.id }
  }
}

@Injectable()
export class CreateDebtHandler {
  constructor(
    private readonly repo: PersonalCrmRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateDebtCommand): Promise<{ id: string }> {
    const debt = ContactDebt.create({
      tenantId: command.tenantId,
      contactId: command.contactId,
      direction: command.direction,
      amount: command.amount,
      reason: command.reason,
      status: command.status,
      dueDate: command.dueDate,
    })

    await this.repo.saveDebt(debt)
    await this.outbox.publish(new DebtRecordedEvent(debt.id, debt.contactId, debt.direction, debt.amount))

    return { id: debt.id }
  }
}

@Injectable()
export class SettleDebtHandler {
  constructor(
    private readonly repo: PersonalCrmRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: SettleDebtCommand): Promise<void> {
    const debt = await this.repo.findDebtById(command.tenantId, command.id)
    if (!debt) throw new NotFoundError('Debt', command.id)

    const settled = debt.settle()
    await this.repo.saveDebt(settled)
    await this.outbox.publish(new DebtSettledEvent(settled.id, settled.contactId, settled.amount))
  }
}

@Injectable()
export class CreateReminderHandler {
  constructor(
    private readonly repo: PersonalCrmRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateReminderCommand): Promise<{ id: string }> {
    const reminder = ContactReminder.create({
      tenantId: command.tenantId,
      contactId: command.contactId,
      title: command.title,
      description: command.description,
      frequencyType: command.frequencyType ?? 'YEARLY',
      frequencyInterval: command.frequencyInterval,
      nextDueDate: command.nextDueDate ?? new Date(),
      isActive: command.isActive,
    })

    await this.repo.saveReminder(reminder)
    await this.outbox.publish(new ReminderCreatedEvent(reminder.id, reminder.contactId, reminder.title))

    return { id: reminder.id }
  }
}

@Injectable()
export class ToggleReminderHandler {
  constructor(
    private readonly repo: PersonalCrmRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: ToggleReminderCommand): Promise<void> {
    const reminder = await this.repo.findReminderById(command.tenantId, command.id)
    if (!reminder) throw new NotFoundError('Reminder', command.id)

    const toggled = reminder.toggle()
    await this.repo.saveReminder(toggled)
  }
}

@Injectable()
export class AddPetHandler {
  constructor(
    private readonly repo: PersonalCrmRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: AddPetCommand): Promise<{ id: string }> {
    const pet = ContactPet.create({
      tenantId: command.tenantId,
      contactId: command.contactId,
      petCategory: command.petCategory,
      name: command.name,
      breed: command.breed,
    })

    await this.repo.savePet(pet)
    await this.outbox.publish(new PetAddedEvent(pet.id, pet.contactId, pet.petCategory, pet.name))

    return { id: pet.id }
  }
}
