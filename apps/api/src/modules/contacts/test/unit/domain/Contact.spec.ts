import { Contact } from '../../../domain/entities/Contact'
import { LeadStatus } from '../../../domain/value-objects/LeadStatus'

describe('Contact Domain Entity', () => {
  it('should create a contact with valid default values', () => {
    const contact = Contact.create({
      tenantId: 'tenant-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+123456789',
    })

    expect(contact.id).toBeDefined()
    expect(contact.tenantId).toBe('tenant-123')
    expect(contact.firstName).toBe('John')
    expect(contact.lastName).toBe('Doe')
    expect(contact.leadStatus.value).toBe('NEW')
    expect(contact.isStarred).toBe(false)
    expect(contact.loyaltyPoints).toBe(0)
    expect(contact.createdAt).toBeInstanceOf(Date)
  })

  it('should update contact properties immutably', () => {
    const contact = Contact.create({
      tenantId: 'tenant-123',
      firstName: 'John',
      lastName: 'Doe',
    })

    const updated = contact.update({
      firstName: 'Johnny',
      leadStatus: LeadStatus.fromString('QUALIFIED'),
      isStarred: true,
    })

    expect(updated.firstName).toBe('Johnny')
    expect(updated.leadStatus.value).toBe('QUALIFIED')
    expect(updated.isStarred).toBe(true)
    expect(contact.firstName).toBe('John') // original unchanged
  })
})
