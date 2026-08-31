import { DrizzleNotificationsRepository } from '../../infrastructure/drizzle-notifications.repository'
import { NotificationChannel } from '../../domain/entities/notification.entity'
import * as dbModule from '@crm/database'

describe('DrizzleNotificationsRepository - Persistence Integration Tests', () => {
  let repository: DrizzleNotificationsRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        notificationChannels: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
        notificationTemplates: {
          findFirst: jest.fn(),
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
    repository = new DrizzleNotificationsRepository()
  })

  it('should find channel by id and map provider config', async () => {
    mockDb.query.notificationChannels.findFirst.mockResolvedValue({
      id: 'chan-1',
      tenantId: 'tenant-1',
      channelType: 'EMAIL',
      providerType: 'SES',
      name: 'Primary Email SES',
      configJson: { region: 'us-east-1' },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const channel = await repository.findChannelById('chan-1')

    expect(channel).not.toBeNull()
    expect(channel?.name).toBe('Primary Email SES')
    expect(channel?.channelType).toBe('EMAIL')
  })

  it('should save notification channel', async () => {
    const channel = NotificationChannel.create({
      tenantId: 'tenant-1',
      channelType: 'SMS',
      providerType: 'CUSTOM',
      name: 'SMS Gateway',
    })

    await repository.saveChannel(channel)

    expect(mockDb.insert).toHaveBeenCalled()
  })
})
