import { Deal } from '../../domain/entities/deal.entity'
import { Pipeline } from '../../domain/entities/pipeline.entity'
import { PipelineStage } from '../../domain/entities/pipeline-stage.entity'

describe('Pipelines & Deals Domain Entities', () => {
  describe('Deal Entity', () => {
    it('should create a deal with default OPEN status and amount', () => {
      const deal = Deal.create({
        tenantId: 'tenant-1',
        pipelineId: 'pipe-1',
        stageId: 'stage-1',
        name: 'Enterprise Cloud Migration',
        amount: 75000,
        expectedCloseDate: '2026-11-30',
        assignedUserId: 'rep-42',
      })

      expect(deal.id).toBeDefined()
      expect(deal.status).toBe('OPEN')
      expect(deal.amount).toBe(75000)
      expect(deal.assignedUserId).toBe('rep-42')
    })

    it('should transition deal to WON', () => {
      const deal = Deal.create({
        tenantId: 'tenant-1',
        pipelineId: 'pipe-1',
        stageId: 'stage-1',
        name: 'Deal Q3',
        amount: 25000,
      })

      const wonDeal = deal.win()
      expect(wonDeal.status).toBe('WON')
      expect(wonDeal.updatedAt).toBeInstanceOf(Date)
    })

    it('should transition deal to LOST with reason and notes', () => {
      const deal = Deal.create({
        tenantId: 'tenant-1',
        pipelineId: 'pipe-1',
        stageId: 'stage-1',
        name: 'Deal Q3',
      })

      const lostDeal = deal.lose('Competitor Price', 'Lost to competitor offering 30% discount')
      expect(lostDeal.status).toBe('LOST')
      expect(lostDeal.lostReasonId).toBe('Competitor Price')
      expect(lostDeal.lostNotes).toBe('Lost to competitor offering 30% discount')
    })

    it('should move deal to another pipeline stage via update', () => {
      const deal = Deal.create({
        tenantId: 'tenant-1',
        pipelineId: 'pipe-1',
        stageId: 'stage-qualification',
        name: 'Deal Discovery',
      })

      const moved = deal.update({ stageId: 'stage-negotiation' })
      expect(moved.stageId).toBe('stage-negotiation')
    })
  })

  describe('Pipeline & PipelineStage Entities', () => {
    it('should create pipeline with ordered stages', () => {
      const pipeline = Pipeline.create({ tenantId: 'tenant-1', name: 'Standard Sales Flow' })
      const stage1 = PipelineStage.create({
        tenantId: 'tenant-1',
        pipelineId: pipeline.id,
        name: 'Lead Qualified',
        probabilityPercent: 25,
        displayOrder: 0,
      })

      expect(pipeline.name).toBe('Standard Sales Flow')
      expect(stage1.probabilityPercent).toBe(25)
      expect(stage1.displayOrder).toBe(0)
    })
  })
})
