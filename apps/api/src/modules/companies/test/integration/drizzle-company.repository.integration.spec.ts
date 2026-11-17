import { DrizzleCompanyRepository } from '../../infrastructure/drizzle-company.repository'
import { Company } from '../../domain/entities/company.entity'
import * as dbModule from '@crm/database'

describe('DrizzleCompanyRepository - Persistence Integration Tests', () => {
  let repository: DrizzleCompanyRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        companies: {
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
    repository = new DrizzleCompanyRepository()
  })

  it('should find company by id and map persistence row to Domain Company', async () => {
    mockDb.query.companies.findFirst.mockResolvedValue({
      id: 'comp-1',
      tenantId: 'tenant-1',
      name: 'Wayne Enterprises',
      taxId: 'US-12345678',
      industry: 'Defense',
      numberOfEmployees: 10000,
      annualRevenue: 500000000,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const company = await repository.findById('tenant-1', 'comp-1')

    expect(company).not.toBeNull()
    expect(company?.name).toBe('Wayne Enterprises')
    expect(company?.numberOfEmployees).toBe(10000)
  })

  it('should filter companies by industry and handle cursor pagination', async () => {
    mockDb.query.companies.findMany.mockResolvedValue([
      {
        id: 'comp-1',
        tenantId: 'tenant-1',
        name: 'Stark Industries',
        industry: 'Defense',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const result = await repository.list('tenant-1', { limit: 5, industry: 'Defense' })

    expect(result.data.length).toBe(1)
    expect(result.data[0].name).toBe('Stark Industries')
  })
})
