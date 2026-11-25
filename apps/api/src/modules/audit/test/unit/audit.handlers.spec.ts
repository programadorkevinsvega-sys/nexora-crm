import { CreateAuditLogHandler, CreateAuditLogCommand } from '../../application/handlers'
import { AuditLog } from '../../domain/entities/audit.entity'
import { AuditRepository } from '../../domain/repositories/audit.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'

describe('Audit Module - Unit Tests', () => {
  type RepoMock = jest.Mocked<Pick<AuditRepository, 'save'>>
  type OutboxMock = jest.Mocked<Pick<OutboxService, 'publish'>>
  let mockRepo: RepoMock
  let mockOutbox: OutboxMock

  beforeEach(() => {
    mockRepo = {
      save: jest.fn<ReturnType<AuditRepository['save']>, Parameters<AuditRepository['save']>>().mockResolvedValue(undefined),
    }
    mockOutbox = {
      publish: jest.fn<ReturnType<OutboxService['publish']>, Parameters<OutboxService['publish']>>().mockResolvedValue(undefined),
    }
  })

  describe('CreateAuditLogHandler', () => {
    it('should record audit trail for compliance and emit event', async () => {
      const handler = new CreateAuditLogHandler(
        mockRepo as unknown as AuditRepository,
        mockOutbox as unknown as OutboxService,
      )
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
