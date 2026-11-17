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
import { CreateCompanySchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { CompaniesBffService, CompanyFilters, PaginatedResult } from './companies.bff.service'
import type { CreateCompany, UpdateCompany, Company } from '@crm/contracts'

@ApiTags('Empresas (Companies)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino (Opcional, por defecto demo)' })
@Controller('api/companies')
export class CompaniesBffController {
  constructor(private readonly service: CompaniesBffService) {}

  @Get()
  @ApiOperation({ summary: 'Listar empresas con búsqueda y filtros' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre o dominio' })
  @ApiQuery({ name: 'industry', required: false, description: 'Filtrar por industria/sector' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de resultados (defecto: 20)' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Cursor para paginación' })
  async list(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('industry') industry?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Company>> {
    const filters: CompanyFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      search,
      industry,
    }
    return this.service.list(filters, tenantId!)
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva empresa B2B' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'Acme Corporation' },
        domain: { type: 'string', example: 'acmecorp.com' },
        industry: { type: 'string', example: 'Software & SaaS' },
        size: { type: 'string', example: '50-200 empleados' },
        phone: { type: 'string', example: '+573001234567' },
        address: { type: 'string', example: 'Av. Principal # 123' },
        city: { type: 'string', example: 'Bogotá' },
        country: { type: 'string', example: 'Colombia' },
      },
    },
  })
  async create(
    @Body(createZodPipe(CreateCompanySchema)) dto: CreateCompany,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Company> {
    return this.service.create(dto, tenantId!)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de una empresa por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la empresa' })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Company> {
    return this.service.getById(id, tenantId!)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar información de una empresa' })
  @ApiParam({ name: 'id', description: 'UUID de la empresa' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Acme Corp Global' },
        domain: { type: 'string', example: 'acmecorp.com' },
        industry: { type: 'string', example: 'Tecnología' },
        size: { type: 'string', example: '200-500 empleados' },
        phone: { type: 'string', example: '+573009876543' },
        city: { type: 'string', example: 'Medellín' },
        country: { type: 'string', example: 'Colombia' },
      },
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompany,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Company> {
    return this.service.update(id, dto, tenantId!)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una empresa' })
  @ApiParam({ name: 'id', description: 'UUID de la empresa' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.delete(id, tenantId!)
  }
}
