import { GetTeamHandler, GetQuotaHandler } from '../../application/queries/sales-team.handlers'
import { SalesTeam } from '../../domain/entities/sales-team.entity'
import { SalesQuota } from '../../domain/entities/sales-quota.entity'
import { NotFoundError } from '@crm/shared'

describe('Sales Teams Queries - Unit Tests', () => {
  let mockTeamRepo: any
  let mockQuotaRepo: any

  beforeEach(() => {
    mockTeamRepo = { findByIdWithMembers: jest.fn(), list: jest.fn() }
    mockQuotaRepo = { findById: jest.fn(), listByTeam: jest.fn() }
  })

  describe('GetTeamHandler', () => {
    it('should return sales team with members', async () => {
      const team = SalesTeam.create({ tenantId: 'tenant-1', name: 'SDR Team', managerUserId: 'mgr-1' })
      mockTeamRepo.findByIdWithMembers.mockResolvedValue(team)

      const handler = new GetTeamHandler(mockTeamRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', id: team.id })

      expect(result).toBe(team)
    })

    it('should throw NotFoundError if team does not exist', async () => {
      mockTeamRepo.findByIdWithMembers.mockResolvedValue(null)

      const handler = new GetTeamHandler(mockTeamRepo)
      await expect(handler.execute({ tenantId: 'tenant-1', id: 'missing' })).rejects.toThrow(NotFoundError)
    })
  })

  describe('GetQuotaHandler', () => {
    it('should return quota by id', async () => {
      const quota = SalesQuota.create({ tenantId: 'tenant-1', userId: 'u-1', periodMonth: 1, periodYear: 2026, targetAmount: 50000 })
      mockQuotaRepo.findById.mockResolvedValue(quota)

      const handler = new GetQuotaHandler(mockQuotaRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', id: quota.id })

      expect(result).toBe(quota)
    })
  })
})
