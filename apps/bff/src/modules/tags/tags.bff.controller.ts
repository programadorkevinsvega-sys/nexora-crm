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
import { CreateTagSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { TagsBffService } from './tags.bff.service'
import type { CreateTag, Tag } from '@crm/contracts'

@ApiTags('Etiquetas (Tags)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/tags')
export class TagsBffController {
  constructor(private readonly service: TagsBffService) {}

  @Get()
  @ApiOperation({ summary: 'Listar etiquetas para contactos y empresas' })
  @ApiQuery({ name: 'search', required: false, description: 'Filtrar por nombre de etiqueta' })
  async list(
    @Query('search') search?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ data: Tag[] }> {
    const result = await this.service.list({ tenantId: tenantId || '00000000-0000-0000-0000-000000000001', search })
    return { data: result.data }
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva etiqueta con color' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'Cliente VIP' },
        color: { type: 'string', example: '#10B981' },
      },
    },
  })
  async create(
    @Body(createZodPipe(CreateTagSchema)) dto: CreateTag,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Tag> {
    return this.service.create(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener etiqueta por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la etiqueta' })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Tag> {
    return this.service.getById(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar nombre o color de una etiqueta' })
  @ApiParam({ name: 'id', description: 'UUID de la etiqueta' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Cliente Estratégico' },
        color: { type: 'string', example: '#3B82F6' },
      },
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { name?: string; color?: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Tag> {
    return this.service.update(id, dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una etiqueta' })
  @ApiParam({ name: 'id', description: 'UUID de la etiqueta' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.delete(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
