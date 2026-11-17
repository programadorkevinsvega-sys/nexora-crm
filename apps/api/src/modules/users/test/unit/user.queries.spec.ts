import { GetUserHandler, FindByEmailHandler, ListUsersHandler } from '../../application/queries/user.handlers'
import { User } from '../../domain/entities/user.entity'
import { NotFoundError } from '@crm/shared'

describe('Users Queries - Unit Tests', () => {
  let mockRepo: any

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      list: jest.fn(),
    }
  })

  describe('GetUserHandler', () => {
    it('should return user by id', async () => {
      const user = User.create({
        tenantId: 'tenant-1',
        email: 'dev@example.com',
        profileType: 'NATURAL_PERSON',
      })
      mockRepo.findById.mockResolvedValue(user)

      const handler = new GetUserHandler(mockRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', id: user.id })

      expect(result).toBe(user)
    })

    it('should throw NotFoundError if user does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null)

      const handler = new GetUserHandler(mockRepo)
      await expect(handler.execute({ tenantId: 'tenant-1', id: 'missing' })).rejects.toThrow(NotFoundError)
    })
  })

  describe('FindByEmailHandler', () => {
    it('should normalize email before looking up', async () => {
      const user = User.create({
        tenantId: 'tenant-1',
        email: 'john@example.com',
        profileType: 'NATURAL_PERSON',
      })
      mockRepo.findByEmail.mockResolvedValue(user)

      const handler = new FindByEmailHandler(mockRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', email: '  JOHN@example.com  ' })

      expect(result).toBe(user)
      expect(mockRepo.findByEmail).toHaveBeenCalledWith('tenant-1', 'john@example.com')
    })
  })
})
