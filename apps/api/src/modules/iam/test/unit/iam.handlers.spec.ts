import { CreateRoleHandler, UpdateRoleHandler, AssignRoleHandler } from '../../application/commands/iam.handlers'
import { Role } from '../../domain/entities/role.entity'
import { User } from '../../../users/domain/entities/user.entity'
import { ConflictException } from '@nestjs/common'
import { IamRepository } from '../../domain/repositories/iam.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { UserRepository } from '../../../users/domain/repositories/user.repository'

describe('IAM Module - Unit Tests', () => {
  type RepoMock = jest.Mocked<Pick<IamRepository, 'findRoleByName' | 'findRoleById' | 'saveRole' | 'assignRoleToUser'>>
  type OutboxMock = jest.Mocked<Pick<OutboxService, 'publish'>>
  type UsersMock = jest.Mocked<Pick<UserRepository, 'findById'>>
  let mockRepo: RepoMock
  let mockOutbox: OutboxMock
  let mockUsers: UsersMock

  beforeEach(() => {
    mockRepo = {
      findRoleByName: jest.fn<ReturnType<IamRepository['findRoleByName']>, Parameters<IamRepository['findRoleByName']>>(),
      findRoleById: jest.fn<ReturnType<IamRepository['findRoleById']>, Parameters<IamRepository['findRoleById']>>(),
      saveRole: jest.fn<ReturnType<IamRepository['saveRole']>, Parameters<IamRepository['saveRole']>>().mockResolvedValue(undefined),
      assignRoleToUser: jest.fn<ReturnType<IamRepository['assignRoleToUser']>, Parameters<IamRepository['assignRoleToUser']>>().mockResolvedValue(undefined),
    }
    mockOutbox = {
      publish: jest.fn<ReturnType<OutboxService['publish']>, Parameters<OutboxService['publish']>>().mockResolvedValue(undefined),
    }
    mockUsers = {
      findById: jest.fn<ReturnType<UserRepository['findById']>, Parameters<UserRepository['findById']>>().mockResolvedValue(
        User.create({ tenantId: 'tenant-1', email: 'user@example.test', profileType: 'NATURAL_PERSON' }),
      ),
    }
  })

  describe('CreateRoleHandler', () => {
    it('should create and persist a new role', async () => {
      mockRepo.findRoleByName.mockResolvedValue(null)
      const handler = new CreateRoleHandler(mockRepo as unknown as IamRepository, mockOutbox as unknown as OutboxService)

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

      const handler = new CreateRoleHandler(mockRepo as unknown as IamRepository, mockOutbox as unknown as OutboxService)
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

      const handler = new UpdateRoleHandler(mockRepo as unknown as IamRepository, mockOutbox as unknown as OutboxService)
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
      mockUsers.findById.mockResolvedValue(
        User.create({ tenantId: 'tenant-1', email: 'user@example.test', profileType: 'NATURAL_PERSON' }),
      )

      const handler = new AssignRoleHandler(
        mockRepo as unknown as IamRepository,
        mockUsers as unknown as UserRepository,
        mockOutbox as unknown as OutboxService,
      )
      await handler.execute({
        tenantId: 'tenant-1',
        userId: 'user-99',
        roleId: role.id,
      })

      expect(mockUsers.findById).toHaveBeenCalledWith('tenant-1', 'user-99')
      expect(mockRepo.assignRoleToUser).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalled()
    })

    it('should reject assignment when the user does not belong to the tenant', async () => {
      const role = Role.create({ tenantId: 'tenant-1', name: 'Rep' })
      mockRepo.findRoleById.mockResolvedValue(role)
      mockUsers.findById.mockResolvedValue(null)

      const handler = new AssignRoleHandler(
        mockRepo as unknown as IamRepository,
        mockUsers as unknown as UserRepository,
        mockOutbox as unknown as OutboxService,
      )
      await expect(handler.execute({
        tenantId: 'tenant-1',
        userId: 'user-99',
        roleId: role.id,
      })).rejects.toThrow('User not found')

      expect(mockRepo.assignRoleToUser).not.toHaveBeenCalled()
      expect(mockOutbox.publish).not.toHaveBeenCalled()
    })
  })
})
