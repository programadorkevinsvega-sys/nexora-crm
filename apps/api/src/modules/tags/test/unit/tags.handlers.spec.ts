import { CreateTagHandler, UpdateTagHandler } from '../../application/commands/tag.handlers'
import { Tag } from '../../domain/entities/tag.entity'

describe('Tags Module - Unit Tests', () => {
  let mockRepo: any

  beforeEach(() => {
    mockRepo = { create: jest.fn().mockResolvedValue(undefined), findById: jest.fn(), update: jest.fn().mockResolvedValue(undefined), delete: jest.fn().mockResolvedValue(undefined) }
  })

  describe('CreateTagHandler', () => {
    it('should create and persist a global tag', async () => {
      const handler = new CreateTagHandler(mockRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', name: 'VIP Customer', color: '#FF0000' })

      expect(result.id).toBeDefined()
      expect(mockRepo.create).toHaveBeenCalled()
    })
  })

  describe('UpdateTagHandler', () => {
    it('should update tag color and name', async () => {
      const tag = Tag.create({ id: 'tag-1', tenantId: 'tenant-1', name: 'Old Tag', color: '#000000', createdAt: new Date() })
      mockRepo.findById.mockResolvedValue(tag)

      const handler = new UpdateTagHandler(mockRepo)
      await handler.execute({ tenantId: 'tenant-1', id: 'tag-1', name: 'Updated Tag', color: '#00FF00' })

      expect(mockRepo.update).toHaveBeenCalled()
    })
  })
})
