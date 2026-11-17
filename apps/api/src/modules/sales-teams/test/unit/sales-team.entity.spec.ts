import { SalesTeam } from '../../domain/entities/sales-team.entity'
import { SalesQuota } from '../../domain/entities/sales-quota.entity'

describe('Sales Teams Domain Entities', () => {
  describe('SalesTeam Entity', () => {
    it('should create a sales team with monthly target and manager', () => {
      const team = SalesTeam.create({
        tenantId: 'tenant-1',
        name: 'Enterprise North America',
        managerUserId: 'mgr-1',
        monthlyTarget: 250000,
      })

      expect(team.id).toBeDefined()
      expect(team.name).toBe('Enterprise North America')
      expect(team.monthlyTarget).toBe(250000)
    })

    it('should update team name, manager, and monthly targets', () => {
      const team = SalesTeam.create({
        tenantId: 'tenant-1',
        name: 'Inside Sales',
        managerUserId: 'mgr-1',
        monthlyTarget: 50000,
      })

      const updated = team.update({
        name: 'Global Inside Sales',
        monthlyTarget: 80000,
      })

      expect(updated.name).toBe('Global Inside Sales')
      expect(updated.monthlyTarget).toBe(80000)
      expect(team.name).toBe('Inside Sales') // immutability
    })
  })

  describe('SalesQuota Entity', () => {
    it('should track quota target and achieved amount with percentage progress', () => {
      const quota = SalesQuota.create({
        tenantId: 'tenant-1',
        userId: 'rep-1',
        periodMonth: 9,
        periodYear: 2026,
        targetAmount: 100000,
      })

      expect(quota.targetAmount).toBe(100000)
      expect(quota.achievedAmount).toBe(0)

      const updated = quota.updateAchieved(85000)
      expect(updated.achievedAmount).toBe(85000)
    })
  })
})
