import { CreateContactUseCase } from '../../../application/use-cases/CreateContactUseCase'
import { IContactRepository, ContactFilter, PaginatedContacts } from '../../../domain/repositories/IContactRepository'
import { IEventPublisherPort } from '../../../application/ports/out/IEventPublisherPort'
import { Contact } from '../../../domain/entities/Contact'
import { DomainEvent } from '@crm/shared'

class InMemoryContactRepository implements IContactRepository {
  private contacts: Map<string, Contact> = new Map()

  async findById(_tenantId: string, id: string): Promise<Contact | null> {
    return this.contacts.get(id) ?? null
  }

  async findByEmail(_tenantId: string, email: string): Promise<Contact | null> {
    for (const c of this.contacts.values()) {
      if (c.email === email) return c
    }
    return null
  }

  async list(_tenantId: string, _filter: ContactFilter): Promise<PaginatedContacts> {
    return { data: Array.from(this.contacts.values()), nextCursor: null }
  }

  async save(contact: Contact): Promise<void> {
    this.contacts.set(contact.id, contact)
  }

  async delete(_tenantId: string, id: string): Promise<void> {
    this.contacts.delete(id)
  }
}

class FakeEventPublisher implements IEventPublisherPort {
  public publishedEvents: DomainEvent[] = []

  async publish(event: DomainEvent): Promise<void> {
    this.publishedEvents.push(event)
  }

  async publishMany(events: DomainEvent[]): Promise<void> {
    this.publishedEvents.push(...events)
  }
}

describe('CreateContactUseCase', () => {
  it('should create a contact and publish a domain event', async () => {
    const repo = new InMemoryContactRepository()
    const publisher = new FakeEventPublisher()
    const useCase = new CreateContactUseCase(repo, publisher)

    const result = await useCase.execute({
      tenantId: 'tenant-abc',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      phone: '+15551234',
    })

    expect(result.id).toBeDefined()
    const saved = await repo.findById('tenant-abc', result.id)
    expect(saved).not.toBeNull()
    expect(saved?.firstName).toBe('Alice')
    expect(publisher.publishedEvents.length).toBe(1)
    expect(publisher.publishedEvents[0].eventName).toBe('contact.created')
  })
})
