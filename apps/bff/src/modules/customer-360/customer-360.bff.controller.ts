import { Controller, Get, Param, Headers, ParseUUIDPipe } from '@nestjs/common'
import { Customer360BffService } from './customer-360.bff.service'
import type { Customer360Profile } from '@crm/contracts'

@Controller('api/contacts')
export class Customer360BffController {
  constructor(private readonly service: Customer360BffService) {}

  @Get(':id/360')
  async getCustomer360(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Customer360Profile> {
    return this.service.getCustomer360(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
