import { Customer360 } from '../entities/customer-360.entity'

export abstract class Customer360Repository {
  abstract getProfile(tenantId: string, contactId: string): Promise<Customer360 | null>
}
