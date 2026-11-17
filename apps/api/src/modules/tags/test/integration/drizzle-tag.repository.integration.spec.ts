import { DrizzleTagRepository } from '../../infrastructure/drizzle-tag.repository'
import { Tag } from '../../domain/entities/tag.entity'
import * as dbModule from '@crm/database'

describe('DrizzleTagRepository - Persistence Integration Tests', () => {
  let repository: DrizzleTagRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              {
                id: 'tag-1',
                tenantId: 'tenant-1',
                name: 'VIP-Client',
                color: '#FF0000',
                createdAt: new Date(),
              },
            ]),
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleTagRepository()
  })

  it('should find tag by id and return Tag domain entity', async () => {
    const tag = await repository.findById('tenant-1', 'tag-1')

    expect(tag).not.toBeNull()
    expect(tag?.name).toBe('VIP-Client')
    expect(tag?.color).toBe('#FF0000')
  })

  it('should insert tag into tags table', async () => {
    const tag = Tag.create({
      id: 'tag-new',
      tenantId: 'tenant-1',
      name: 'High-Value',
      color: '#00FF00',
      createdAt: new Date(),
    })

    await repository.create(tag)

    expect(mockDb.insert).toHaveBeenCalled()
  })
})
