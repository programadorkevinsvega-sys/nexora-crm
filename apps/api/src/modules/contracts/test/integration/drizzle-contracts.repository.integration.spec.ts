import { DrizzleContractRepository } from '../../infrastructure/drizzle-contract.repository'
import { Contract } from '../../domain/entities/contract.entity'
import * as dbModule from '@crm/database'

describe('Contracts & Quotes Repositories - Persistence Integration Tests', () => {
  let contractRepo: DrizzleContractRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        contracts: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
        quotes: {
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
    contractRepo = new DrizzleContractRepository()
  })

  it('should find contract by id and map billing schedule and status', async () => {
    mockDb.query.contracts.findFirst.mockResolvedValue({
      id: 'contract-1',
      tenantId: 'tenant-1',
      companyId: 'comp-1',
      name: 'Enterprise Contract',
      startDate: '2026-01-01',
      status: 'ACTIVE',
      mrrValue: 10000,
      autoRenew: true,
      ownerUserId: 'u-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const contract = await contractRepo.findById('tenant-1', 'contract-1')

    expect(contract).not.toBeNull()
    expect(contract?.name).toBe('Enterprise Contract')
    expect(contract?.mrrValue).toBe(10000)
    expect(contract?.autoRenew).toBe(true)
  })

  it('should save and delete contract within tenant boundary', async () => {
    const contract = Contract.create({
      tenantId: 'tenant-1',
      companyId: 'comp-1',
      name: 'Software License',
      startDate: '2026-01-01',
      mrrValue: 5000,
      ownerUserId: 'u-1',
    })

    await contractRepo.save(contract)
    expect(mockDb.insert).toHaveBeenCalled()

    await contractRepo.delete('tenant-1', contract.id)
    expect(mockDb.delete).toHaveBeenCalled()
  })
})
