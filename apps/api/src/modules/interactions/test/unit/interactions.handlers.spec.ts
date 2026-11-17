import { CreateNoteHandler, CreateTaskHandler, CreateCallHandler } from '../../application/commands/interactions.handlers'

describe('Interactions Module - Unit Tests', () => {
  let mockNoteRepo: any
  let mockTaskRepo: any
  let mockCallRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockNoteRepo = { save: jest.fn().mockResolvedValue(undefined), findById: jest.fn(), delete: jest.fn() }
    mockTaskRepo = { save: jest.fn().mockResolvedValue(undefined), findById: jest.fn(), delete: jest.fn() }
    mockCallRepo = { save: jest.fn().mockResolvedValue(undefined), findById: jest.fn() }
    mockOutbox = { publish: jest.fn().mockResolvedValue(undefined) }
  })

  describe('CreateNoteHandler', () => {
    it('should create and persist a customer note with outbox event', async () => {
      const handler = new CreateNoteHandler(mockNoteRepo, mockOutbox)
      const result = await handler.execute({
        tenantId: 'tenant-1',
        content: 'Client confirmed budget approval.',
        authorUserId: 'rep-1',
        contactId: 'contact-1',
      })

      expect(result.id).toBeDefined()
      expect(mockNoteRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })

  describe('CreateTaskHandler', () => {
    it('should create and persist a task with due date', async () => {
      const handler = new CreateTaskHandler(mockTaskRepo, mockOutbox)
      const result = await handler.execute({
        tenantId: 'tenant-1',
        title: 'Follow up on proposal',
        dueDate: new Date('2026-09-01T10:00:00Z'),
        assignedUserId: 'rep-1',
        contactId: 'contact-1',
      })

      expect(result.id).toBeDefined()
      expect(mockTaskRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })

  describe('CreateCallHandler', () => {
    it('should log a completed phone call', async () => {
      const handler = new CreateCallHandler(mockCallRepo, mockOutbox)
      const result = await handler.execute({
        tenantId: 'tenant-1',
        contactId: 'contact-1',
        callType: 'OUTBOUND',
        durationSeconds: 180,
        summary: 'Discussed onboarding requirements.',
        happenedAt: new Date(),
        authorUserId: 'rep-1',
      })

      expect(result.id).toBeDefined()
      expect(mockCallRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })
})
