import { DrizzleTenantsRepository } from '../../infrastructure/drizzle-tenants.repository'
import { Tenant } from '../../domain/entities/tenant.entity'
import * as dbModule from '@crm/database'

describe('DrizzleTenantsRepository - Persistence Integration Tests', () => {
  let repository: DrizzleTenantsRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        tenants: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
        branches: {
          findMany: jest.fn(),
        },
        tenantBranding: {
          findFirst: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleTenantsRepository()
  })

  it('should find tenant by id and reconstitute domain entity', async () => {
    mockDb.query.tenants.findFirst.mockResolvedValue({
      id: 'tenant-100',
      name: 'OmniCorp',
      status: 'ACTIVE',
      industryType: 'Manufacturing',
      timezone: 'America/New_York',
      currencyCode: 'USD',
      ownerUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const tenant = await repository.findTenantById('tenant-100')

    expect(tenant).not.toBeNull()
    expect(tenant?.name).toBe('OmniCorp')
    expect(tenant?.timezone).toBe('America/New_York')
  })

  it('should persist new tenant entity with onConflictDoUpdate', async () => {
    const tenant = Tenant.create({
      name: 'Cyberdyne Systems',
      industryType: 'AI & Robotics',
      ownerUserId: 'user-99',
    })

    await repository.saveTenant(tenant)

    expect(mockDb.insert).toHaveBeenCalled()
  })
})
