import { CreateChannelHandler, CreateChannelCommand } from '../../application/handlers'
import { NotificationChannel } from '../../domain/entities/notification.entity'

describe('Notifications Module - Unit Tests', () => {
  let mockRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockRepo = { saveChannel: jest.fn().mockResolvedValue(undefined), findChannelById: jest.fn(), deleteChannel: jest.fn() }
    mockOutbox = { publish: jest.fn().mockResolvedValue(undefined) }
  })

  describe('CreateChannelHandler', () => {
    it('should create an email delivery channel and emit event', async () => {
      const handler = new CreateChannelHandler(mockRepo, mockOutbox)
      const command = new CreateChannelCommand('tenant-1', 'EMAIL', 'RESEND', 'Transactional Email Gateway', { apiKey: 're_123' })

      const result = await handler.execute(command)

      expect(result).toBeInstanceOf(NotificationChannel)
      expect(result.name).toBe('Transactional Email Gateway')
      expect(mockRepo.saveChannel).toHaveBeenCalledWith(result)
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })
})
