import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { CreateContactSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { ContactsBffService, ContactFilters, PaginatedResult } from './contacts.bff.service'
import type { CreateContact, UpdateContact, Contact } from '@crm/contracts'

@Controller('api/contacts')
export class ContactsBffController {
  constructor(private readonly service: ContactsBffService) {}

  @Get()
  async list(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('leadStatus') leadStatus?: string,
    @Query('companyId') companyId?: string,
    @Query('isStarred') isStarred?: string,
    @Query('assignedUserId') assignedUserId?: string,
    @Query('scope') scope?: 'mine' | 'team' | 'all',
    @Headers('X-Tenant-Id') tenantId?: string,
    @Headers('X-User-Id') userId?: string,
    @Headers('X-User-Role') userRole?: string,
  ): Promise<PaginatedResult<Contact>> {
    const filters: ContactFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      search,
      leadStatus,
      companyId,
      isStarred: isStarred != null ? isStarred === 'true' : undefined,
      assignedUserId,
      requestingUserId: userId,
      requestingUserRole: userRole,
      scope,
    }
    return this.service.list(filters, tenantId!)
  }

  @Post()
  async create(
    @Body(createZodPipe(CreateContactSchema)) dto: CreateContact,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Contact> {
    return this.service.create(dto, tenantId!)
  }

  @Get(':id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Contact> {
    return this.service.getById(id, tenantId!)
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContact,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Contact> {
    return this.service.update(id, dto, tenantId!)
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.delete(id, tenantId!)
  }
}
