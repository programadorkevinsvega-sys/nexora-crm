import { Controller, Get, Param, Headers, ParseUUIDPipe } from '@nestjs/common'
import { GetCustomer360Handler } from '../../application/queries/customer-360.handlers'
import { GetCustomer360Query } from '../../application/queries/customer-360.queries'

@Controller('customer-360')
export class Customer360Controller {
  constructor(private readonly getCustomer360Handler: GetCustomer360Handler) {}

  @Get(':contactId')
  async getProfile(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Headers('X-Tenant-Id') tenantId: string = '00000000-0000-0000-0000-000000000001',
  ) {
    return this.getCustomer360Handler.execute(
      new GetCustomer360Query(tenantId, contactId),
    )
  }
}
