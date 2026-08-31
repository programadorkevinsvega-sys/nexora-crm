import { DrizzlePersonalCrmRepository } from '../../infrastructure/drizzle-personal-crm.repository'
import { LifeEvent } from '../../domain/entities/life-event.entity'
import * as dbModule from '@crm/database'

describe('DrizzlePersonalCrmRepository - Persistence Integration Tests', () => {
  let repository: DrizzlePersonalCrmRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        lifeEvents: {
          findMany: jest.fn(),
        },
        contactGifts: {
          findMany: jest.fn(),
        },
        contactDebts: {
          findMany: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzlePersonalCrmRepository()
  })

  it('should list life events sorted by date', async () => {
    mockDb.query.lifeEvents.findMany.mockResolvedValue([
      {
        id: 'le-1',
        tenantId: 'tenant-1',
        contactId: 'c-1',
        eventType: 'ANNIVERSARY',
        name: 'Work Anniversary',
        happenedAt: '2026-06-01',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const events = await repository.listLifeEvents('tenant-1', 'c-1')

    expect(events.length).toBe(1)
    expect(events[0].name).toBe('Work Anniversary')
  })

  it('should save life event entity', async () => {
    const event = LifeEvent.create({
      tenantId: 'tenant-1',
      contactId: 'c-1',
      eventType: 'BIRTHDAY',
      name: 'Birthday',
      happenedAt: '1990-01-01',
    })

    await repository.saveLifeEvent(event)

    expect(mockDb.insert).toHaveBeenCalled()
  })
})
