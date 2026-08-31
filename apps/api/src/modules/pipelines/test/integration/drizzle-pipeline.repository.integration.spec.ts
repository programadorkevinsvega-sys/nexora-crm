import { DrizzleDealRepository } from '../../infrastructure/drizzle-deal.repository'
import { DrizzlePipelineRepository } from '../../infrastructure/drizzle-pipeline.repository'
import { Deal } from '../../domain/entities/deal.entity'
import { Pipeline } from '../../domain/entities/pipeline.entity'
import * as dbModule from '@crm/database'

describe('Pipelines & Deals Repositories - Persistence Integration Tests', () => {
  let dealRepo: DrizzleDealRepository
  let pipelineRepo: DrizzlePipelineRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        deals: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
        pipelines: {
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
    dealRepo = new DrizzleDealRepository()
    pipelineRepo = new DrizzlePipelineRepository()
  })

  it('should find pipeline and map to domain entity', async () => {
    mockDb.query.pipelines.findFirst.mockResolvedValue({
      id: 'pipe-1',
      tenantId: 'tenant-1',
      name: 'Enterprise Deals 2026',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const pipeline = await pipelineRepo.findById('tenant-1', 'pipe-1')

    expect(pipeline).not.toBeNull()
    expect(pipeline?.name).toBe('Enterprise Deals 2026')
  })

  it('should list deals with pipeline and stage filters', async () => {
    mockDb.query.deals.findMany.mockResolvedValue([
      {
        id: 'deal-10',
        tenantId: 'tenant-1',
        pipelineId: 'pipe-1',
        stageId: 'stage-closed',
        name: 'Cloud Contract',
        amount: 80000,
        status: 'WON',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const deals = await dealRepo.list('tenant-1', { pipelineId: 'pipe-1', status: 'WON' })

    expect(deals.length).toBe(1)
    expect(deals[0].status).toBe('WON')
    expect(deals[0].amount).toBe(80000)
  })
})
