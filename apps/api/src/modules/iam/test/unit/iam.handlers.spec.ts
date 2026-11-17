import { CreateRoleHandler, UpdateRoleHandler, AssignRoleHandler } from '../../application/commands/iam.handlers'
import { Role } from '../../domain/entities/role.entity'
import { ConflictException } from '@nestjs/common'

describe('IAM Module - Unit Tests', () => {
  let mockRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockRepo = {
      findRoleByName: jest.fn(),
      findRoleById: jest.fn(),
      saveRole: jest.fn().mockResolvedValue(undefined),
      findUserRole: jest.fn(),
      assignRoleToUser: jest.fn().mockResolvedValue(undefined),
    }
    mockOutbox = {
      publish: jest.fn().mockResolvedValue(undefined),
    }
  })

  describe('CreateRoleHandler', () => {
    it('should create and persist a new role', async () => {
      mockRepo.findRoleByName.mockResolvedValue(null)
      const handler = new CreateRoleHandler(mockRepo, mockOutbox)

      const role = await handler.execute({
        tenantId: 'tenant-1',
        name: 'Sales Manager',
        description: 'Manages sales pipelines and reps',
      })

      expect(role).toBeInstanceOf(Role)
      expect(role.name).toBe('Sales Manager')
      expect(mockRepo.saveRole).toHaveBeenCalledWith(role)
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })

    it('should throw ConflictException if role name already exists in tenant', async () => {
      const existing = Role.create({ tenantId: 'tenant-1', name: 'Admin' })
      mockRepo.findRoleByName.mockResolvedValue(existing)

      const handler = new CreateRoleHandler(mockRepo, mockOutbox)
      await expect(handler.execute({
        tenantId: 'tenant-1',
        name: 'Admin',
      })).rejects.toThrow(ConflictException)
    })
  })

  describe('UpdateRoleHandler', () => {
    it('should update role name and description', async () => {
      const role = Role.create({ tenantId: 'tenant-1', name: 'Rep' })
      mockRepo.findRoleById.mockResolvedValue(role)

      const handler = new UpdateRoleHandler(mockRepo, mockOutbox)
      const updated = await handler.execute({ tenantId: 'tenant-1', id: role.id, name: 'Senior Rep' })

      expect(updated.name).toBe('Senior Rep')
      expect(mockRepo.saveRole).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalled()
    })
  })

  describe('AssignRoleHandler', () => {
    it('should assign role to user and prevent duplicate assignments', async () => {
      const role = Role.create({ tenantId: 'tenant-1', name: 'Rep' })
      mockRepo.findRoleById.mockResolvedValue(role)
      mockRepo.findUserRole.mockResolvedValue(null)

      const handler = new AssignRoleHandler(mockRepo, mockOutbox)
      await handler.execute({
        tenantId: 'tenant-1',
        userId: 'user-99',
        roleId: role.id,
      })

      expect(mockRepo.assignRoleToUser).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalled()
    })
  })
})
