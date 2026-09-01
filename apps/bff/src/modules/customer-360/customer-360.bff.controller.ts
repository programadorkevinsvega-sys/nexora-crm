import { Controller, Get, Param, Headers, ParseUUIDPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam, ApiHeader } from '@nestjs/swagger'
import { Customer360BffService } from './customer-360.bff.service'
import type { Customer360Profile } from '@crm/contracts'

@ApiTags('Vista 360 del Cliente (Customer 360)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/contacts')
export class Customer360BffController {
  constructor(private readonly service: Customer360BffService) {}

  @Get(':id/360')
  @ApiOperation({ summary: 'Obtener vista 360 unificada del cliente: historial, compras, tickets, score y timeline' })
  @ApiParam({ name: 'id', description: 'UUID del contacto' })
  async getCustomer360(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Customer360Profile> {
    return this.service.getCustomer360(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
