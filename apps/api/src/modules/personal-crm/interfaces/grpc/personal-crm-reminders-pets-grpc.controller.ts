import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateReminderHandler,
  ToggleReminderHandler,
  AddPetHandler,
} from '../../application/commands/personal-crm.handlers'
import {
  ListRemindersHandler,
  ListPetsHandler,
} from '../../application/queries/personal-crm.handlers'
import {
  CreateReminderCommand,
  ToggleReminderCommand,
  AddPetCommand,
} from '../../application/commands/personal-crm.commands'
import {
  ListRemindersQuery,
  ListPetsQuery,
} from '../../application/queries/personal-crm.queries'
import { PersonalCrmMapper } from '../../infrastructure/personal-crm.mapper'
import { FrequencyType } from '../../domain/entities/contact-reminder.entity'

@Controller()
export class PersonalCrmRemindersPetsGrpcController {
  constructor(
    private readonly createReminderHandler: CreateReminderHandler,
    private readonly listRemindersHandler: ListRemindersHandler,
    private readonly toggleReminderHandler: ToggleReminderHandler,
    private readonly addPetHandler: AddPetHandler,
    private readonly listPetsHandler: ListPetsHandler,
  ) {}

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
      jsonItems: reminders.map((r) => JSON.stringify(PersonalCrmMapper.reminderToResponse(r))),
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
      jsonItems: pets.map((p) => JSON.stringify(PersonalCrmMapper.petToResponse(p))),
    }
  }
}
