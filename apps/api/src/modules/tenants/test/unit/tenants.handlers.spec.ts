import { CreateTenantHandler, UpdateTenantHandler, DeleteTenantHandler, CreateBranchHandler } from '../../application/commands/tenants.handlers'
import { Tenant } from '../../domain/entities/tenant.entity'
import { Branch } from '../../domain/entities/branch.entity'
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common'

describe('Tenants Module - Unit Tests', () => {
  let mockRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockRepo = {
      saveTenant: jest.fn().mockResolvedValue(undefined),
      findTenantById: jest.fn(),
      deleteTenant: jest.fn().mockResolvedValue(undefined),
      listBranches: jest.fn().mockResolvedValue([]),
      saveBranch: jest.fn().mockResolvedValue(undefined),
      findBranchById: jest.fn(),
    }
    mockOutbox = {
      publish: jest.fn().mockResolvedValue(undefined),
    }
  })

  describe('CreateTenantHandler', () => {
    it('should successfully create and persist a tenant and emit outbox event', async () => {
      const handler = new CreateTenantHandler(mockRepo, mockOutbox)
      const command = {
        name: 'Acme Corp',
        industryType: 'SaaS',
        ownerUserId: 'user-123',
        currencyCode: 'USD',
        timezone: 'America/Bogota',
      }

      const result = await handler.execute(command)

      expect(result).toBeInstanceOf(Tenant)
      expect(result.name).toBe('Acme Corp')
      expect(result.status).toBe('ACTIVE')
      expect(mockRepo.saveTenant).toHaveBeenCalledWith(result)
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })

  describe('UpdateTenantHandler', () => {
    it('should update an existing tenant and emit event', async () => {
      const existing = Tenant.create({ name: 'Old Name', industryType: 'Tech', ownerUserId: 'user-1' })
      mockRepo.findTenantById.mockResolvedValue(existing)

      const handler = new UpdateTenantHandler(mockRepo, mockOutbox)
      const result = await handler.execute({ id: existing.id, name: 'New Name' })

      expect(result.name).toBe('New Name')
      expect(mockRepo.saveTenant).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalled()
    })

    it('should throw NotFoundException if tenant does not exist', async () => {
      mockRepo.findTenantById.mockResolvedValue(null)
      const handler = new UpdateTenantHandler(mockRepo, mockOutbox)

      await expect(handler.execute({ id: 'non-existent', name: 'Test' })).rejects.toThrow(NotFoundException)
    })
  })

  describe('DeleteTenantHandler', () => {
    it('should prevent deletion of ACTIVE tenants', async () => {
      const activeTenant = Tenant.create({ name: 'Active Corp', industryType: 'Tech', ownerUserId: 'user-1' })
      mockRepo.findTenantById.mockResolvedValue(activeTenant)

      const handler = new DeleteTenantHandler(mockRepo, mockOutbox)
      await expect(handler.execute({ id: activeTenant.id })).rejects.toThrow(BadRequestException)
    })

    it('should delete INACTIVE tenant and emit event', async () => {
      const inactive = Tenant.create({ name: 'Inactive Corp', industryType: 'Tech', ownerUserId: 'user-1' })
      const suspended = inactive.update({ status: 'SUSPENDED' })
      mockRepo.findTenantById.mockResolvedValue(suspended)

      const handler = new DeleteTenantHandler(mockRepo, mockOutbox)
      await handler.execute({ id: suspended.id })

      expect(mockRepo.deleteTenant).toHaveBeenCalledWith(suspended.id)
      expect(mockOutbox.publish).toHaveBeenCalled()
    })
  })

  describe('CreateBranchHandler', () => {
    it('should prevent duplicate headquarters branches for the same tenant', async () => {
      const existingHq = Branch.create({ tenantId: 't-1', name: 'HQ', isHeadquarters: true })
      mockRepo.listBranches.mockResolvedValue([existingHq])

      const handler = new CreateBranchHandler(mockRepo, mockOutbox)
      await expect(handler.execute({
        tenantId: 't-1',
        name: 'Second HQ',
        isHeadquarters: true,
      })).rejects.toThrow(ConflictException)
    })
  })
})
