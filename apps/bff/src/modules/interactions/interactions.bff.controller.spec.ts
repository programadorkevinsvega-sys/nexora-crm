import { CreateNoteSchema, CreateTaskSchema, CreateCallSchema } from '@crm/contracts'
import { NotesBffController } from './notes.bff.controller'
import { TasksBffController } from './tasks.bff.controller'
import { CallsBffController } from './calls.bff.controller'

describe('Interactions BFF Controllers - Notes, Tasks, Calls', () => {
  let notesController: NotesBffController
  let tasksController: TasksBffController
  let callsController: CallsBffController
  let mockService: any

  beforeEach(() => {
    mockService = {
      createNote: jest.fn().mockImplementation((dto, tenantId) => Promise.resolve({ id: 'note-1', ...dto, tenantId })),
      listNotes: jest.fn().mockResolvedValue({ data: [], nextCursor: null }),
      createTask: jest.fn().mockImplementation((dto, tenantId) => Promise.resolve({ id: 'task-1', ...dto, tenantId })),
      listTasks: jest.fn().mockResolvedValue({ data: [], nextCursor: null }),
      createCall: jest.fn().mockImplementation((dto, tenantId) => Promise.resolve({ id: 'call-1', ...dto, tenantId })),
      listCalls: jest.fn().mockResolvedValue({ data: [], nextCursor: null }),
    }

    notesController = new NotesBffController(mockService)
    tasksController = new TasksBffController(mockService)
    callsController = new CallsBffController(mockService)
  })

  describe('Notes', () => {
    it('should validate and parse note payload with null optional fields', () => {
      const parsed = CreateNoteSchema.parse({
        content: 'Meeting notes',
        contactId: null,
        companyId: null,
        dealId: null,
      })
      expect(parsed.content).toBe('Meeting notes')
    })

    it('should inject authorUserId from authenticated user when creating note', async () => {
      const user = { tenantId: 'tenant-1', userId: 'user-uuid-123', sub: 'user-uuid-123' } as any
      const result = await notesController.createNote(
        { content: 'Follow-up needed' } as any,
        user,
      )

      expect(result.id).toBe('note-1')
      expect(mockService.createNote).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'Follow-up needed', authorUserId: 'user-uuid-123' }),
        'tenant-1',
      )
    })
  })

  describe('Tasks', () => {
    it('should validate task with simple date and null description', () => {
      const parsed = CreateTaskSchema.parse({
        title: 'Review proposal',
        dueDate: '2026-09-30',
        description: null,
      })
      expect(parsed.title).toBe('Review proposal')
      expect(parsed.dueDate).toBe('2026-09-30')
    })

    it('should normalize simple date to ISO string and inject assignedUserId', async () => {
      const user = { tenantId: 'tenant-1', userId: 'user-uuid-456', sub: 'user-uuid-456' } as any
      const result = await tasksController.createTask(
        { title: 'Prepare deck', dueDate: '2026-09-30' } as any,
        user,
      )

      expect(result.id).toBe('task-1')
      expect(mockService.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Prepare deck',
          assignedUserId: 'user-uuid-456',
          dueDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        }),
        'tenant-1',
      )
    })
  })

  describe('Calls', () => {
    it('should validate call with standard date format and null summary', () => {
      const parsed = CreateCallSchema.parse({
        callType: 'OUTBOUND',
        happenedAt: '2026-08-29',
        summary: null,
      })
      expect(parsed.callType).toBe('OUTBOUND')
    })

    it('should normalize call date and inject authorUserId', async () => {
      const user = { tenantId: 'tenant-1', userId: 'user-uuid-789', sub: 'user-uuid-789' } as any
      const result = await callsController.createCall(
        { callType: 'OUTBOUND', happenedAt: '2026-08-29' } as any,
        user,
      )

      expect(result.id).toBe('call-1')
      expect(mockService.createCall).toHaveBeenCalledWith(
        expect.objectContaining({
          callType: 'OUTBOUND',
          authorUserId: 'user-uuid-789',
          happenedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        }),
        'tenant-1',
      )
    })
  })
})
