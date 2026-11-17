import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { GetCustomer360Handler } from '../../application/queries/customer-360.handlers'
import { GetCustomer360Query } from '../../application/queries/customer-360.queries'

@Controller()
export class Customer360GrpcController {
  constructor(private readonly getCustomer360Handler: GetCustomer360Handler) {}

  @GrpcMethod('Customer360Service', 'GetCustomer360')
  async getCustomer360(data: { tenantId: string; contactId: string }) {
    const profile = await this.getCustomer360Handler.execute(
      new GetCustomer360Query(data.tenantId, data.contactId),
    )
    return { json: JSON.stringify(profile) }
  }
}
