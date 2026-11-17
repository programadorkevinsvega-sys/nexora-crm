import { CreateAuditLogHandler, CreateAuditLogCommand } from '../../application/handlers'
import { AuditLog } from '../../domain/entities/audit.entity'

describe('Audit Module - Unit Tests', () => {
  let mockRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockRepo = { save: jest.fn().mockResolvedValue(undefined), list: jest.fn() }
    mockOutbox = { publish: jest.fn().mockResolvedValue(undefined) }
  })

  describe('CreateAuditLogHandler', () => {
    it('should record audit trail for compliance and emit event', async () => {
      const handler = new CreateAuditLogHandler(mockRepo, mockOutbox)
      const command = new CreateAuditLogCommand(
        'tenant-1',
        'Contact',
        'contact-123',
        'UPDATE',
        'email',
        'old@example.com',
        'new@example.com',
        'admin-1',
        'contacts',
      )

      const result = await handler.execute(command)

      expect(result).toBeInstanceOf(AuditLog)
      expect(result.action).toBe('UPDATE')
      expect(mockRepo.save).toHaveBeenCalledWith(result)
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })
})
