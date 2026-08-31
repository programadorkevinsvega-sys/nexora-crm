import { GetPipelineHandler, ListPipelinesHandler, GetDealHandler } from '../../application/queries/pipeline.handlers'
import { Pipeline } from '../../domain/entities/pipeline.entity'
import { Deal } from '../../domain/entities/deal.entity'
import { NotFoundError } from '@crm/shared'

describe('Pipelines & Deals Queries - Unit Tests', () => {
  let mockPipelineRepo: any
  let mockDealRepo: any

  beforeEach(() => {
    mockPipelineRepo = { findById: jest.fn(), list: jest.fn() }
    mockDealRepo = { findById: jest.fn(), list: jest.fn() }
  })

  describe('GetPipelineHandler', () => {
    it('should return pipeline if found', async () => {
      const pipeline = Pipeline.create({ tenantId: 'tenant-1', name: 'Sales' })
      mockPipelineRepo.findById.mockResolvedValue(pipeline)

      const handler = new GetPipelineHandler(mockPipelineRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', id: pipeline.id })

      expect(result).toBe(pipeline)
    })

    it('should throw NotFoundError if pipeline does not exist', async () => {
      mockPipelineRepo.findById.mockResolvedValue(null)

      const handler = new GetPipelineHandler(mockPipelineRepo)
      await expect(handler.execute({ tenantId: 'tenant-1', id: 'missing' })).rejects.toThrow(NotFoundError)
    })
  })

  describe('GetDealHandler', () => {
    it('should return deal by id', async () => {
      const deal = Deal.create({ tenantId: 'tenant-1', pipelineId: 'p-1', stageId: 's-1', name: 'Cloud SaaS' })
      mockDealRepo.findById.mockResolvedValue(deal)

      const handler = new GetDealHandler(mockDealRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', id: deal.id })

      expect(result).toBe(deal)
    })
  })
})
