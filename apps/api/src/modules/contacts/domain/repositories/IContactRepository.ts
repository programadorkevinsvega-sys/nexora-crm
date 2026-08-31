import { Contact } from '../entities/Contact'

export interface ContactFilter {
  search?: string
  leadStatus?: string
  companyId?: string
  isStarred?: boolean
  assignedUserId?: string
  visibleUserIds?: string[]
  cursor?: string
  limit: number
}

export interface PaginatedContacts {
  data: Contact[]
  nextCursor: string | null
}

export interface IContactRepository {
  findById(tenantId: string, id: string): Promise<Contact | null>
  findByEmail(tenantId: string, email: string): Promise<Contact | null>
  list(tenantId: string, filter: ContactFilter): Promise<PaginatedContacts>
  save(contact: Contact): Promise<void>
  delete(tenantId: string, id: string): Promise<void>
}
