import { CreateTaskHandler, CreateTaskCommand } from '../../application/handlers'
import { ScheduledTask } from '../../domain/entities/scheduler.entity'

describe('Scheduler Module - Unit Tests', () => {
  let mockRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockRepo = { saveTask: jest.fn().mockResolvedValue(undefined), findTaskById: jest.fn() }
    mockOutbox = { publish: jest.fn().mockResolvedValue(undefined) }
  })

  describe('CreateTaskHandler', () => {
    it('should register a recurring cron task and emit outbox event', async () => {
      const handler = new CreateTaskHandler(mockRepo, mockOutbox)
      const command = new CreateTaskCommand(
        'tenant-1',
        'Daily Revenue Aggregate',
        'Recalculates ARR/MRR at midnight',
        '0 0 * * *',
        'analytics.aggregate',
        'analytics',
        '/cron/aggregate',
        {},
        true,
        3,
        300,
        'system',
      )

      const result = await handler.execute(command)

      expect(result).toBeInstanceOf(ScheduledTask)
      expect(result.name).toBe('Daily Revenue Aggregate')
      expect(mockRepo.saveTask).toHaveBeenCalledWith(result)
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })
})
