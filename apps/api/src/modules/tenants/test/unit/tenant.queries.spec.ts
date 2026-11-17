import { GetTenantHandler, GetBrandingHandler, ListBranchesHandler } from '../../application/queries/tenants.handlers'
import { Tenant } from '../../domain/entities/tenant.entity'
import { TenantBranding } from '../../domain/entities/branding.entity'
import { NotFoundException } from '@nestjs/common'

describe('Tenants Queries - Unit Tests', () => {
  let mockRepo: any

  beforeEach(() => {
    mockRepo = {
      findTenantById: jest.fn(),
      findBranding: jest.fn(),
      listBranches: jest.fn(),
    }
  })

  describe('GetTenantHandler', () => {
    it('should return tenant by id', async () => {
      const tenant = Tenant.create({ name: 'Acme Corp', industryType: 'Tech', ownerUserId: 'u-1' })
      mockRepo.findTenantById.mockResolvedValue(tenant)

      const handler = new GetTenantHandler(mockRepo)
      const result = await handler.execute(tenant.id)

      expect(result).toBe(tenant)
    })

    it('should throw NotFoundException if tenant not found', async () => {
      mockRepo.findTenantById.mockResolvedValue(null)

      const handler = new GetTenantHandler(mockRepo)
      await expect(handler.execute('missing')).rejects.toThrow(NotFoundException)
    })
  })

  describe('GetBrandingHandler', () => {
    it('should return branding configuration', async () => {
      const branding = TenantBranding.create({ tenantId: 'tenant-1', primaryColor: '#123456' })
      mockRepo.findBranding.mockResolvedValue(branding)

      const handler = new GetBrandingHandler(mockRepo)
      const result = await handler.execute({ tenantId: 'tenant-1' })

      expect(result).toBe(branding)
    })
  })
})
