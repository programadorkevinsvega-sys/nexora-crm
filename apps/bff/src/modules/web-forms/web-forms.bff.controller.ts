import {
  Controller, Get, Post, Put, Delete, Param, Body, Headers, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiHeader } from '@nestjs/swagger'
import { WebFormsBffService } from './web-forms.bff.service'
import type { CreateWebForm, UpdateWebForm, WebForm } from '@crm/contracts'

@ApiTags('Formularios Web (Web Forms)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/forms')
export class WebFormsBffController {
  constructor(private readonly service: WebFormsBffService) {}

  @Get()
  @ApiOperation({ summary: 'Listar formularios web para incrustar' })
  async list(@Headers('X-Tenant-Id') tenantId?: string): Promise<WebForm[]> {
    return this.service.list(tenantId)
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo formulario web con campos y diseño' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'slug', 'fields'],
      properties: {
        name: { type: 'string', example: 'Formulario de Contacto Web' },
        slug: { type: 'string', example: 'contacto-web' },
        fields: {
          type: 'array',
          items: { type: 'object' },
          example: [{ label: 'Nombre', fieldName: 'firstName', fieldType: 'TEXT', isRequired: true }],
        },
        autoCreateDeal: { type: 'boolean', example: true },
      },
    },
  })
  async create(
    @Body() dto: CreateWebForm,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WebForm> {
    return this.service.create(dto, tenantId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener formulario por ID' })
  @ApiParam({ name: 'id', description: 'UUID del formulario' })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WebForm> {
    return this.service.getById(id, tenantId)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar configuración o campos del formulario' })
  @ApiParam({ name: 'id', description: 'UUID del formulario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Formulario de Contacto Actualizado' },
        successMessage: { type: 'string', example: '¡Gracias! Nos pondremos en contacto pronto.' },
      },
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWebForm,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<WebForm> {
    return this.service.update(id, dto, tenantId)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar formulario web' })
  @ApiParam({ name: 'id', description: 'UUID del formulario' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ success: boolean }> {
    await this.service.delete(id, tenantId)
    return { success: true }
  }

  @Get(':id/submissions')
  @ApiOperation({ summary: 'Listar envíos/leads capturados por el formulario' })
  @ApiParam({ name: 'id', description: 'UUID del formulario' })
  async getSubmissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ) {
    return this.service.listSubmissions(id, tenantId)
  }
}
