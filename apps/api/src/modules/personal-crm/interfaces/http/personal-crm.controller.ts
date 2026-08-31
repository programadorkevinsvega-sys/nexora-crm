import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common'
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
import {
  CreateLifeEventDto,
  CreateGiftDto,
  CreateDebtDto,
  CreateReminderDto,
  AddPetDto,
} from './dto/personal-crm.dto'
import { TenantId } from '../../../../common/decorators/tenant-id.decorator'
import { PersonalCrmMapper } from '../../infrastructure/personal-crm.mapper'

@Controller('personal-crm')
export class PersonalCrmController {
  constructor(
    private readonly createLifeEventHandler: CreateLifeEventHandler,
    private readonly createGiftHandler: CreateGiftHandler,
    private readonly createDebtHandler: CreateDebtHandler,
    private readonly settleDebtHandler: SettleDebtHandler,
    private readonly createReminderHandler: CreateReminderHandler,
    private readonly toggleReminderHandler: ToggleReminderHandler,
    private readonly addPetHandler: AddPetHandler,
    private readonly listLifeEventsHandler: ListLifeEventsHandler,
    private readonly listGiftsHandler: ListGiftsHandler,
    private readonly listDebtsHandler: ListDebtsHandler,
    private readonly listRemindersHandler: ListRemindersHandler,
    private readonly listPetsHandler: ListPetsHandler,
  ) {}

  @Get('life-events')
  async listLifeEvents(@Query('contactId') contactId: string, @TenantId() tenantId: string) {
    const events = await this.listLifeEventsHandler.execute(new ListLifeEventsQuery(tenantId, contactId))
    return { data: events.map(PersonalCrmMapper.lifeEventToResponse) }
  }

  @Post('life-events')
  async createLifeEvent(@Body() dto: CreateLifeEventDto, @TenantId() tenantId: string) {
    return this.createLifeEventHandler.execute(
      new CreateLifeEventCommand(tenantId, dto.contactId, dto.eventType, dto.name, dto.description, dto.happenedAt, dto.isYearlyRecurring),
    )
  }

  @Get('gifts')
  async listGifts(@Query('contactId') contactId: string, @TenantId() tenantId: string) {
    const gifts = await this.listGiftsHandler.execute(new ListGiftsQuery(tenantId, contactId))
    return { data: gifts.map(PersonalCrmMapper.giftToResponse) }
  }

  @Post('gifts')
  async createGift(@Body() dto: CreateGiftDto, @TenantId() tenantId: string) {
    return this.createGiftHandler.execute(
      new CreateGiftCommand(tenantId, dto.contactId, dto.direction ?? 'GIVEN', dto.name, dto.description, dto.url, dto.estimatedValue, dto.status, dto.dateGivenOrReceived),
    )
  }

  @Get('debts')
  async listDebts(@Query('contactId') contactId: string, @TenantId() tenantId: string) {
    const debts = await this.listDebtsHandler.execute(new ListDebtsQuery(tenantId, contactId))
    return { data: debts.map(PersonalCrmMapper.debtToResponse) }
  }

  @Post('debts')
  async createDebt(@Body() dto: CreateDebtDto, @TenantId() tenantId: string) {
    return this.createDebtHandler.execute(
      new CreateDebtCommand(tenantId, dto.contactId, dto.direction, dto.amount, dto.reason, dto.status, dto.dueDate),
    )
  }

  @Put('debts/:id/settle')
  async settleDebt(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.settleDebtHandler.execute(new SettleDebtCommand(tenantId, id))
    return { id }
  }

  @Get('reminders')
  async listReminders(@Query('contactId') contactId: string, @TenantId() tenantId: string) {
    const reminders = await this.listRemindersHandler.execute(new ListRemindersQuery(tenantId, contactId))
    return { data: reminders.map(PersonalCrmMapper.reminderToResponse) }
  }

  @Post('reminders')
  async createReminder(@Body() dto: CreateReminderDto, @TenantId() tenantId: string) {
    return this.createReminderHandler.execute(
      new CreateReminderCommand(tenantId, dto.contactId, dto.title, dto.description, dto.frequencyType, dto.frequencyInterval, dto.nextDueDate, dto.isActive),
    )
  }

  @Put('reminders/:id/toggle')
  async toggleReminder(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.toggleReminderHandler.execute(new ToggleReminderCommand(tenantId, id))
    return { id }
  }

  @Get('pets')
  async listPets(@Query('contactId') contactId: string, @TenantId() tenantId: string) {
    const pets = await this.listPetsHandler.execute(new ListPetsQuery(tenantId, contactId))
    return { data: pets.map(PersonalCrmMapper.petToResponse) }
  }

  @Post('pets')
  async addPet(@Body() dto: AddPetDto, @TenantId() tenantId: string) {
    return this.addPetHandler.execute(new AddPetCommand(tenantId, dto.contactId, dto.petCategory, dto.name, dto.breed))
  }
}
