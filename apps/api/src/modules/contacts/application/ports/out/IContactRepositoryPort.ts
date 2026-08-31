import { IContactRepository, ContactFilter, PaginatedContacts } from '../../../domain/repositories/IContactRepository'
import { Contact } from '../../../domain/entities/Contact'

export const CONTACT_REPOSITORY_TOKEN = Symbol('IContactRepositoryPort')

export abstract class ContactRepositoryPort implements IContactRepository {
  abstract findById(tenantId: string, id: string): Promise<Contact | null>
  abstract findByEmail(tenantId: string, email: string): Promise<Contact | null>
  abstract list(tenantId: string, filter: ContactFilter): Promise<PaginatedContacts>
  abstract save(contact: Contact): Promise<void>
  abstract delete(tenantId: string, id: string): Promise<void>
}
