import { CreateTeamHandler, UpdateTeamHandler } from '../../application/commands/sales-team.handlers'
import { SalesTeam } from '../../domain/entities/sales-team.entity'

describe('Sales Teams Module - Unit Tests', () => {
  let mockRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockRepo = { save: jest.fn().mockResolvedValue(undefined), findById: jest.fn() }
    mockOutbox = { publish: jest.fn().mockResolvedValue(undefined) }
  })

  describe('CreateTeamHandler', () => {
    it('should create a sales team with target and emit event', async () => {
      const handler = new CreateTeamHandler(mockRepo, mockOutbox)
      const result = await handler.execute({
        tenantId: 'tenant-1',
        name: 'Enterprise LATAM',
        managerUserId: 'manager-1',
        monthlyTarget: 100000,
      })

      expect(result.id).toBeDefined()
      expect(mockRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })

  describe('UpdateTeamHandler', () => {
    it('should update sales team target', async () => {
      const team = SalesTeam.create({ tenantId: 'tenant-1', name: 'SDR Team', managerUserId: 'mgr-1', monthlyTarget: 20000 })
      mockRepo.findById.mockResolvedValue(team)

      const handler = new UpdateTeamHandler(mockRepo, mockOutbox)
      await handler.execute({ tenantId: 'tenant-1', id: team.id, monthlyTarget: 35000 })

      expect(mockRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalled()
    })
  })
})
