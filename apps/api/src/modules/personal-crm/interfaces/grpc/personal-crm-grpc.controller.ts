import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateLifeEventHandler,
  CreateGiftHandler,
  CreateDebtHandler,
  SettleDebtHandler,
  CreateReminderHandler,
  ToggleReminderHandler,
  AddPetHandler,
} from '../../application/commands/personal-crm.handlers'
import {
  ListLifeEventsHandler,
  ListGiftsHandler,
  ListDebtsHandler,
  ListRemindersHandler,
  ListPetsHandler,
} from '../../application/queries/personal-crm.handlers'
import {
  CreateLifeEventCommand,
  CreateGiftCommand,
  CreateDebtCommand,
  SettleDebtCommand,
  CreateReminderCommand,
  ToggleReminderCommand,
  AddPetCommand,
} from '../../application/commands/personal-crm.commands'
import {
  ListLifeEventsQuery,
  ListGiftsQuery,
  ListDebtsQuery,
  ListRemindersQuery,
  ListPetsQuery,
} from '../../application/queries/personal-crm.queries'
import { PersonalCrmMapper } from '../../infrastructure/personal-crm.mapper'
import { GiftDirection, GiftStatus } from '../../domain/entities/contact-gift.entity'
import { DebtDirection, DebtStatus } from '../../domain/entities/contact-debt.entity'
import { FrequencyType } from '../../domain/entities/contact-reminder.entity'

@Controller()
export class PersonalCrmGrpcController {
  constructor(
    private readonly createLifeEventHandler: CreateLifeEventHandler,
    private readonly listLifeEventsHandler: ListLifeEventsHandler,
    private readonly createGiftHandler: CreateGiftHandler,
    private readonly listGiftsHandler: ListGiftsHandler,
    private readonly createDebtHandler: CreateDebtHandler,
    private readonly listDebtsHandler: ListDebtsHandler,
    private readonly settleDebtHandler: SettleDebtHandler,
    private readonly createReminderHandler: CreateReminderHandler,
    private readonly listRemindersHandler: ListRemindersHandler,
    private readonly toggleReminderHandler: ToggleReminderHandler,
    private readonly addPetHandler: AddPetHandler,
    private readonly listPetsHandler: ListPetsHandler,
  ) {}

  @GrpcMethod('PersonalCrmService', 'CreateLifeEvent')
  async createLifeEvent(data: {
    tenantId: string
    contactId: string
    eventType: string
    name: string
    description?: string
    happenedAt?: string
    isYearlyRecurring?: boolean
  }) {
    const result = await this.createLifeEventHandler.execute(
      new CreateLifeEventCommand(
        data.tenantId, data.contactId, data.eventType, data.name,
        data.description, data.happenedAt, data.isYearlyRecurring,
      ),
    )
    return { id: result.id }
  }

  @GrpcMethod('PersonalCrmService', 'ListLifeEvents')
  async listLifeEvents(data: { tenantId: string; contactId?: string }) {
    const events = await this.listLifeEventsHandler.execute(
      new ListLifeEventsQuery(data.tenantId, data.contactId || undefined),
    )
    return {
      jsonItems: events.map(e => JSON.stringify(PersonalCrmMapper.lifeEventToResponse(e))),
    }
  }

  @GrpcMethod('PersonalCrmService', 'CreateGift')
  async createGift(data: {
    tenantId: string
    contactId: string
    direction: string
    name: string
    description?: string
    url?: string
    estimatedValue?: number
    status?: string
    dateGivenOrReceived?: string
  }) {
    const result = await this.createGiftHandler.execute(
      new CreateGiftCommand(
        data.tenantId, data.contactId, data.direction as GiftDirection, data.name,
        data.description, data.url, data.estimatedValue, data.status as GiftStatus,
        data.dateGivenOrReceived,
      ),
    )
    return { id: result.id }
  }

  @GrpcMethod('PersonalCrmService', 'ListGifts')
  async listGifts(data: { tenantId: string; contactId?: string }) {
    const gifts = await this.listGiftsHandler.execute(
      new ListGiftsQuery(data.tenantId, data.contactId || undefined),
    )
    return {
      jsonItems: gifts.map(g => JSON.stringify(PersonalCrmMapper.giftToResponse(g))),
    }
  }

  @GrpcMethod('PersonalCrmService', 'CreateDebt')
  async createDebt(data: {
    tenantId: string
    contactId: string
    direction: string
    amount: number
    reason: string
    status?: string
    dueDate?: string
  }) {
    const result = await this.createDebtHandler.execute(
      new CreateDebtCommand(
        data.tenantId, data.contactId, data.direction as DebtDirection, data.amount,
        data.reason, data.status as DebtStatus, data.dueDate,
      ),
    )
    return { id: result.id }
  }

  @GrpcMethod('PersonalCrmService', 'ListDebts')
  async listDebts(data: { tenantId: string; contactId?: string }) {
    const debts = await this.listDebtsHandler.execute(
      new ListDebtsQuery(data.tenantId, data.contactId || undefined),
    )
    return {
      jsonItems: debts.map(d => JSON.stringify(PersonalCrmMapper.debtToResponse(d))),
    }
  }

  @GrpcMethod('PersonalCrmService', 'SettleDebt')
  async settleDebt(data: { tenantId: string; id: string }) {
    await this.settleDebtHandler.execute(
      new SettleDebtCommand(data.tenantId, data.id),
    )
    return {}
  }

  @GrpcMethod('PersonalCrmService', 'CreateReminder')
  async createReminder(data: {
    tenantId: string
    contactId: string
    title: string
    description?: string
    frequencyType?: string
    frequencyInterval?: number
    nextDueDate?: string
    isActive?: boolean
  }) {
    const result = await this.createReminderHandler.execute(
      new CreateReminderCommand(
        data.tenantId, data.contactId, data.title, data.description,
        data.frequencyType as FrequencyType, data.frequencyInterval, data.nextDueDate,
        data.isActive,
      ),
    )
    return { id: result.id }
  }

  @GrpcMethod('PersonalCrmService', 'ListReminders')
  async listReminders(data: { tenantId: string; contactId?: string }) {
    const reminders = await this.listRemindersHandler.execute(
      new ListRemindersQuery(data.tenantId, data.contactId || undefined),
    )
    return {
      jsonItems: reminders.map(r => JSON.stringify(PersonalCrmMapper.reminderToResponse(r))),
    }
  }

  @GrpcMethod('PersonalCrmService', 'ToggleReminder')
  async toggleReminder(data: { tenantId: string; id: string }) {
    await this.toggleReminderHandler.execute(
      new ToggleReminderCommand(data.tenantId, data.id),
    )
    return {}
  }

  @GrpcMethod('PersonalCrmService', 'AddPet')
  async addPet(data: {
    tenantId: string
    contactId: string
    petCategory: string
    name: string
    breed?: string
  }) {
    const result = await this.addPetHandler.execute(
      new AddPetCommand(data.tenantId, data.contactId, data.petCategory, data.name, data.breed),
    )
    return { id: result.id }
  }

  @GrpcMethod('PersonalCrmService', 'ListPets')
  async listPets(data: { tenantId: string; contactId?: string }) {
    const pets = await this.listPetsHandler.execute(
      new ListPetsQuery(data.tenantId, data.contactId || undefined),
    )
    return {
      jsonItems: pets.map(p => JSON.stringify(PersonalCrmMapper.petToResponse(p))),
    }
  }
}
