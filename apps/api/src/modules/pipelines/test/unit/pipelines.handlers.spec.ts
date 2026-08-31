import { CreatePipelineHandler, CreateDealHandler, UpdateDealHandler } from '../../application/commands/pipeline.handlers'
import { Pipeline } from '../../domain/entities/pipeline.entity'
import { Deal } from '../../domain/entities/deal.entity'
import { NotFoundError } from '@crm/shared'

describe('Pipelines & Deals Module - Unit Tests', () => {
  let mockPipelineRepo: any
  let mockDealRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockPipelineRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    }
    mockDealRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    }
    mockOutbox = {
      publish: jest.fn().mockResolvedValue(undefined),
    }
  })

  describe('CreatePipelineHandler', () => {
    it('should create and persist a sales pipeline with outbox event', async () => {
      const handler = new CreatePipelineHandler(mockPipelineRepo, mockOutbox)
      const result = await handler.execute({ tenantId: 'tenant-1', name: 'Enterprise Sales 2026' })

      expect(result.id).toBeDefined()
      expect(mockPipelineRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })

  describe('CreateDealHandler', () => {
    it('should create and persist a new deal linked to pipeline and stage', async () => {
      const handler = new CreateDealHandler(mockDealRepo, mockOutbox)
      const result = await handler.execute({
        tenantId: 'tenant-1',
        pipelineId: 'pipeline-1',
        stageId: 'stage-1',
        name: 'Deal Acme Corp Q3',
        amount: 50000,
        expectedCloseDate: '2026-12-31',
      })

      expect(result.id).toBeDefined()
      expect(mockDealRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })

  describe('UpdateDealHandler', () => {
    it('should update deal properties and publish event', async () => {
      const deal = Deal.create({
        tenantId: 'tenant-1',
        pipelineId: 'p-1',
        stageId: 's-1',
        name: 'Old Deal',
        amount: 1000,
      })
      mockDealRepo.findById.mockResolvedValue(deal)

      const handler = new UpdateDealHandler(mockDealRepo, mockOutbox)
      await handler.execute({
        tenantId: 'tenant-1',
        id: deal.id,
        name: 'New Deal Name',
        amount: 25000,
      })

      expect(mockDealRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalled()
    })

    it('should throw NotFoundError when updating non-existent deal', async () => {
      mockDealRepo.findById.mockResolvedValue(null)
      const handler = new UpdateDealHandler(mockDealRepo, mockOutbox)

      await expect(handler.execute({
        tenantId: 'tenant-1',
        id: 'non-existent',
        name: 'Test',
      })).rejects.toThrow(NotFoundError)
    })
  })
})
