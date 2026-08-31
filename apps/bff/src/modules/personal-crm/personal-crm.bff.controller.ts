import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { PersonalCrmBffService, PaginatedResult } from './personal-crm.bff.service'
import type {
  CreateLifeEvent, LifeEvent,
  CreateGift, Gift,
  CreateDebt, Debt,
  CreateReminder, Reminder,
  AddPet, Pet,
} from '@crm/contracts'

@Controller('api/personal-crm')
export class PersonalCrmBffController {
  constructor(private readonly service: PersonalCrmBffService) {}

  @Post('life-events')
  async createLifeEvent(
    @Body() dto: CreateLifeEvent,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<LifeEvent> {
    return this.service.createLifeEvent(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('life-events')
  async listLifeEvents(
    @Query('contactId') contactId?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<LifeEvent>> {
    return this.service.listLifeEvents(contactId, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('gifts')
  async createGift(
    @Body() dto: CreateGift,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Gift> {
    return this.service.createGift(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('gifts')
  async listGifts(
    @Query('contactId') contactId?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Gift>> {
    return this.service.listGifts(contactId, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('debts')
  async createDebt(
    @Body() dto: CreateDebt,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Debt> {
    return this.service.createDebt(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('debts')
  async listDebts(
    @Query('contactId') contactId?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Debt>> {
    return this.service.listDebts(contactId, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('debts/:id/settle')
  async settleDebt(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.settleDebt(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('reminders')
  async createReminder(
    @Body() dto: CreateReminder,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Reminder> {
    return this.service.createReminder(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('reminders')
  async listReminders(
    @Query('contactId') contactId?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Reminder>> {
    return this.service.listReminders(contactId, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('reminders/:id/toggle')
  async toggleReminder(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.toggleReminder(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('pets')
  async addPet(
    @Body() dto: AddPet,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Pet> {
    return this.service.addPet(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('pets')
  async listPets(
    @Query('contactId') contactId?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Pet>> {
    return this.service.listPets(contactId, tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
