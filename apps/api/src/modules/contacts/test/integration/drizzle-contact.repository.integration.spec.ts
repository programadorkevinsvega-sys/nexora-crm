import { DrizzleContactRepository } from '../../infrastructure/persistence/drizzle/repositories/DrizzleContactRepository'
import { Contact } from '../../domain/entities/Contact'
import * as dbModule from '@crm/database'

describe('DrizzleContactRepository - Persistence Integration Tests', () => {
  let repository: DrizzleContactRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        contacts: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleContactRepository()
  })

  it('should find contact by tenant and id with domain mapping', async () => {
    mockDb.query.contacts.findFirst.mockResolvedValue({
      id: 'c-100',
      tenantId: 'tenant-1',
      firstName: 'Bruce',
      lastName: 'Wayne',
      email: 'bruce@waynecorp.test',
      phone: null,
      leadStatus: 'QUALIFIED',
      isStarred: true,
      isDeceased: false,
      isTaxLiable: true,
      loyaltyPoints: 500,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const contact = await repository.findById('tenant-1', 'c-100')

    expect(contact).not.toBeNull()
    expect(contact?.firstName).toBe('Bruce')
    expect(contact?.isStarred).toBe(true)
  })

  it('should save contact entity via insert with conflict update', async () => {
    const contact = Contact.create({
      tenantId: 'tenant-1',
      firstName: 'Clark',
      lastName: 'Kent',
      email: 'clark@dailyplanet.test',
    })

    await repository.save(contact)

    expect(mockDb.insert).toHaveBeenCalled()
  })

  it('should paginate and filter contacts by tenantId and status', async () => {
    mockDb.query.contacts.findMany.mockResolvedValue([
      {
        id: 'c-1',
        tenantId: 'tenant-1',
        firstName: 'Diana',
        lastName: 'Prince',
        email: 'diana@themyscira.test',
        leadStatus: 'CUSTOMER',
        isStarred: false,
        isDeceased: false,
        isTaxLiable: true,
        loyaltyPoints: 100,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const result = await repository.list('tenant-1', { limit: 10, leadStatus: 'CUSTOMER' as any })

    expect(result.data.length).toBe(1)
    expect(result.data[0].firstName).toBe('Diana')
  })
})
