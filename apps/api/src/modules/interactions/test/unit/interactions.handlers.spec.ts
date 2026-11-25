import { CreateNoteHandler, CreateTaskHandler, CreateCallHandler } from '../../application/commands/interactions.handlers'
import { NoteRepository } from '../../domain/repositories/note.repository'
import { TaskRepository } from '../../domain/repositories/task.repository'
import { CallRepository } from '../../domain/repositories/call.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'

describe('Interactions Module - Unit Tests', () => {
  type NoteRepoMock = jest.Mocked<Pick<NoteRepository, 'save' | 'findById' | 'delete'>>
  type TaskRepoMock = jest.Mocked<Pick<TaskRepository, 'save' | 'findById' | 'delete'>>
  type CallRepoMock = jest.Mocked<Pick<CallRepository, 'save' | 'findById'>>
  type OutboxMock = jest.Mocked<Pick<OutboxService, 'publish'>>
  let mockNoteRepo: NoteRepoMock
  let mockTaskRepo: TaskRepoMock
  let mockCallRepo: CallRepoMock
  let mockOutbox: OutboxMock

  beforeEach(() => {
    mockNoteRepo = {
      save: jest.fn<ReturnType<NoteRepository['save']>, Parameters<NoteRepository['save']>>().mockResolvedValue(undefined),
      findById: jest.fn<ReturnType<NoteRepository['findById']>, Parameters<NoteRepository['findById']>>(),
      delete: jest.fn<ReturnType<NoteRepository['delete']>, Parameters<NoteRepository['delete']>>(),
    }
    mockTaskRepo = {
      save: jest.fn<ReturnType<TaskRepository['save']>, Parameters<TaskRepository['save']>>().mockResolvedValue(undefined),
      findById: jest.fn<ReturnType<TaskRepository['findById']>, Parameters<TaskRepository['findById']>>(),
      delete: jest.fn<ReturnType<TaskRepository['delete']>, Parameters<TaskRepository['delete']>>(),
    }
    mockCallRepo = {
      save: jest.fn<ReturnType<CallRepository['save']>, Parameters<CallRepository['save']>>().mockResolvedValue(undefined),
      findById: jest.fn<ReturnType<CallRepository['findById']>, Parameters<CallRepository['findById']>>(),
    }
    mockOutbox = { publish: jest.fn<ReturnType<OutboxService['publish']>, Parameters<OutboxService['publish']>>().mockResolvedValue(undefined) }
  })

  describe('CreateNoteHandler', () => {
    it('should create and persist a customer note with outbox event', async () => {
      const handler = new CreateNoteHandler(mockNoteRepo as unknown as NoteRepository, mockOutbox as unknown as OutboxService)
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
      const handler = new CreateTaskHandler(mockTaskRepo as unknown as TaskRepository, mockOutbox as unknown as OutboxService)
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
      const handler = new CreateCallHandler(mockCallRepo as unknown as CallRepository, mockOutbox as unknown as OutboxService)
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
