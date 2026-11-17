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
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiParam, ApiHeader } from '@nestjs/swagger'
import { CreateContactSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { ContactsBffService, ContactFilters, PaginatedResult } from './contacts.bff.service'
import type { CreateContact, UpdateContact, Contact } from '@crm/contracts'

import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Contactos (Contacts)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino (Opcional, por defecto demo)' })
@Controller('api/contacts')
export class ContactsBffController {
  constructor(private readonly service: ContactsBffService) {}

  @Get()
  @ApiOperation({ summary: 'Listar contactos con filtros avanzados' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre, email o teléfono' })
  @ApiQuery({ name: 'leadStatus', required: false, description: 'Estado: NEW, CONTACTED, QUALIFIED, UNQUALIFIED' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Filtrar por UUID de empresa' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de resultados' })
  async list(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('leadStatus') leadStatus?: string,
    @Query('companyId') companyId?: string,
    @Query('isStarred') isStarred?: string,
    @Query('assignedUserId') assignedUserId?: string,
    @Query('scope') scope?: 'mine' | 'team' | 'all',
    @CurrentUser() user?: AuthenticatedUser,
    @Headers('X-Tenant-Id') headerTenantId?: string,
  ): Promise<PaginatedResult<Contact>> {
    const tenantId = user?.tenantId || headerTenantId
    const filters: ContactFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      search,
      leadStatus,
      companyId,
      isStarred: isStarred != null ? isStarred === 'true' : undefined,
      assignedUserId,
      requestingUserId: user?.userId,
      requestingUserRole: user?.role,
      scope,
    }
    return this.service.list(filters, tenantId!)
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo contacto' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['firstName', 'lastName'],
      properties: {
        firstName: { type: 'string', example: 'Carlos' },
        lastName: { type: 'string', example: 'Mendoza' },
        email: { type: 'string', example: 'carlos.mendoza@empresa.com' },
        phone: { type: 'string', example: '+573001234567' },
        jobTitle: { type: 'string', example: 'Director de Compras' },
        companyId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
        leadSource: { type: 'string', example: 'WEBSITE' },
        leadStatus: { type: 'string', example: 'NEW' },
      },
    },
  })
  async create(
    @Body(createZodPipe(CreateContactSchema)) dto: CreateContact,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Contact> {
    return this.service.create(dto, tenantId!)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un contacto por ID' })
  @ApiParam({ name: 'id', description: 'UUID del contacto' })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Contact> {
    return this.service.getById(id, tenantId!)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un contacto' })
  @ApiParam({ name: 'id', description: 'UUID del contacto' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'Carlos' },
        lastName: { type: 'string', example: 'Mendoza' },
        email: { type: 'string', example: 'carlos.mendoza@empresa.com' },
        phone: { type: 'string', example: '+573001234567' },
        jobTitle: { type: 'string', example: 'Gerente General' },
        leadStatus: { type: 'string', example: 'QUALIFIED' },
      },
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContact,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Contact> {
    return this.service.update(id, dto, tenantId!)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un contacto' })
  @ApiParam({ name: 'id', description: 'UUID del contacto' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.delete(id, tenantId!)
  }
}
