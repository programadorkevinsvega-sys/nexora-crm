import { Injectable, NotFoundException } from '@nestjs/common'
import { GetCustomer360Query } from './customer-360.queries'
import { Customer360Repository } from '../../domain/repositories/customer-360.repository'
import { Customer360 } from '../../domain/entities/customer-360.entity'

@Injectable()
export class GetCustomer360Handler {
  constructor(private readonly repo: Customer360Repository) {}

  async execute(query: GetCustomer360Query): Promise<Customer360> {
    const profile = await this.repo.getProfile(query.tenantId, query.contactId)
    if (!profile) {
      throw new NotFoundException(`Customer 360 profile not found for contact ${query.contactId}`)
    }
    return profile
  }
}
