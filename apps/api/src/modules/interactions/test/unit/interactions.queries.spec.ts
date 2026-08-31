import { GetNoteHandler, GetTaskHandler, GetCallHandler } from '../../application/queries/interactions.handlers'
import { Note } from '../../domain/entities/note.entity'
import { Task } from '../../domain/entities/task.entity'
import { Call } from '../../domain/entities/call.entity'
import { NotFoundError } from '@crm/shared'

describe('Interactions Queries - Unit Tests', () => {
  let mockNoteRepo: any
  let mockTaskRepo: any
  let mockCallRepo: any

  beforeEach(() => {
    mockNoteRepo = { findById: jest.fn(), list: jest.fn() }
    mockTaskRepo = { findById: jest.fn(), list: jest.fn() }
    mockCallRepo = { findById: jest.fn(), list: jest.fn() }
  })

  describe('GetNoteHandler', () => {
    it('should return note if exists', async () => {
      const note = Note.create({ tenantId: 'tenant-1', content: 'Met with CFO', authorUserId: 'u-1' })
      mockNoteRepo.findById.mockResolvedValue(note)

      const handler = new GetNoteHandler(mockNoteRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', id: note.id })

      expect(result).toBe(note)
    })

    it('should throw NotFoundError if note missing', async () => {
      mockNoteRepo.findById.mockResolvedValue(null)

      const handler = new GetNoteHandler(mockNoteRepo)
      await expect(handler.execute({ tenantId: 'tenant-1', id: 'missing' })).rejects.toThrow(NotFoundError)
    })
  })

  describe('GetTaskHandler', () => {
    it('should return task if exists', async () => {
      const task = Task.create({ tenantId: 'tenant-1', title: 'Call back', dueDate: new Date(), assignedUserId: 'u-1' })
      mockTaskRepo.findById.mockResolvedValue(task)

      const handler = new GetTaskHandler(mockTaskRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', id: task.id })

      expect(result).toBe(task)
    })
  })

  describe('GetCallHandler', () => {
    it('should return call log if exists', async () => {
      const call = Call.create({ tenantId: 'tenant-1', contactId: 'c-1', callType: 'INBOUND', happenedAt: new Date(), authorUserId: 'u-1' })
      mockCallRepo.findById.mockResolvedValue(call)

      const handler = new GetCallHandler(mockCallRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', id: call.id })

      expect(result).toBe(call)
    })
  })
})
