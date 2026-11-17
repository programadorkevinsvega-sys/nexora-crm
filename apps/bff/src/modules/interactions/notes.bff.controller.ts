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
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger'
import { CreateNoteSchema, UpdateNoteSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { InteractionsBffService, NoteFilters, PaginatedResult } from './interactions.bff.service'
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator'
import type { CreateNote, UpdateNote, Note } from '@crm/contracts'

@ApiTags('Interacciones: Notas (Notes)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/notes')
export class NotesBffController {
  constructor(private readonly service: InteractionsBffService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notas vinculadas a contactos, empresas o deals' })
  @ApiQuery({ name: 'contactId', required: false, description: 'UUID del contacto' })
  @ApiQuery({ name: 'companyId', required: false, description: 'UUID de la empresa' })
  @ApiQuery({ name: 'dealId', required: false, description: 'UUID del deal' })
  async listNotes(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('contactId') contactId?: string,
    @Query('companyId') companyId?: string,
    @Query('dealId') dealId?: string,
    @Query('authorUserId') authorUserId?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Note>> {
    const filters: NoteFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      contactId,
      companyId,
      dealId,
      authorUserId,
    }
    return this.service.listNotes(filters, tenantId!)
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva nota de seguimiento' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['content'],
      properties: {
        content: { type: 'string', example: 'El cliente solicita presentación de propuesta el próximo martes.' },
        contactId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
        dealId: { type: 'string', example: '00000000-0000-0000-0000-000000000002' },
      },
    },
  })
  async createNote(
    @Body(createZodPipe(CreateNoteSchema)) dto: CreateNote,
    @CurrentUser() user?: AuthenticatedUser,
    @Headers('X-Tenant-Id') headerTenantId?: string,
  ): Promise<Note> {
    const tenantId = user?.tenantId || headerTenantId
    const authorUserId = user?.userId || dto.authorUserId || '00000000-0000-0000-0000-000000000002'
    return this.service.createNote({ ...dto, authorUserId }, tenantId!)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una nota por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la nota' })
  async getNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Note> {
    return this.service.getNote(id, tenantId!)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar contenido de una nota' })
  @ApiParam({ name: 'id', description: 'UUID de la nota' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['content'],
      properties: {
        content: { type: 'string', example: 'Reunión aplazada para el miércoles a las 10 AM.' },
      },
    },
  })
  async updateNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(UpdateNoteSchema)) dto: UpdateNote,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Note> {
    return this.service.updateNote(id, dto, tenantId!)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una nota' })
  @ApiParam({ name: 'id', description: 'UUID de la nota' })
  async deleteNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.deleteNote(id, tenantId!)
  }
}
