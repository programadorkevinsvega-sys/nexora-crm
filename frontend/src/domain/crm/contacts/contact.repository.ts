import type { Repository } from "../common/repositories/repository.interface"
import type { Contact, ContactCreateInput, ContactUpdateInput } from "./contact.entity"

export interface ContactFilters {
  companyId?: string
  tenantId?: string
  search?: string
  leadStatus?: string
  isStarred?: boolean
  cursor?: string
  limit?: number
}

export type ContactRepository = Repository<Contact, ContactCreateInput, ContactUpdateInput, ContactFilters>
export type IContactRepository = ContactRepository
