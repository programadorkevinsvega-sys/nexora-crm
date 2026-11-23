import { CreateNoteSchema, CreateTaskSchema, CreateCallSchema } from '@crm/contracts'
import { NotesBffController } from './notes.bff.controller'
import { TasksBffController } from './tasks.bff.controller'
import { CallsBffController } from './calls.bff.controller'

describe('Interactions BFF Controllers - Notes, Tasks, Calls', () => {
  let notesController: NotesBffController
  let tasksController: TasksBffController
  let callsController: CallsBffController
  let mockService: {
    createNote: jest.Mock
    listNotes: jest.Mock
    createTask: jest.Mock
    listTasks: jest.Mock
    createCall: jest.Mock
    listCalls: jest.Mock
  }

  beforeEach(() => {
    mockService = {
      createNote: jest.fn().mockImplementation((dto: Record<string, unknown>, tenantId: string) => Promise.resolve({ id: 'note-1', ...dto, tenantId })),
      listNotes: jest.fn().mockResolvedValue({ data: [], nextCursor: null }),
      createTask: jest.fn().mockImplementation((dto: Record<string, unknown>, tenantId: string) => Promise.resolve({ id: 'task-1', ...dto, tenantId })),
      listTasks: jest.fn().mockResolvedValue({ data: [], nextCursor: null }),
      createCall: jest.fn().mockImplementation((dto: Record<string, unknown>, tenantId: string) => Promise.resolve({ id: 'call-1', ...dto, tenantId })),
      listCalls: jest.fn().mockResolvedValue({ data: [], nextCursor: null }),
    }
    notesController = new NotesBffController(mockService as unknown as ConstructorParameters<typeof NotesBffController>[0])
    tasksController = new TasksBffController(mockService as unknown as ConstructorParameters<typeof TasksBffController>[0])
    callsController = new CallsBffController(mockService as unknown as ConstructorParameters<typeof CallsBffController>[0])
  })

  describe('Notes', () => {
    it('should validate and parse note payload with null optional fields', () => {
      const parsed = CreateNoteSchema.parse({ content: 'Meeting notes', contactId: null, companyId: null, dealId: null })
      expect(parsed.content).toBe('Meeting notes')
    })
    it('should inject authorUserId from authenticated user when creating note', async () => {
      const user = { tenantId: 'tenant-1', userId: 'user-uuid-123', sub: 'user-uuid-123' }
      const result = await notesController.createNote(
        CreateNoteSchema.parse({ content: 'Follow-up needed' }),
        user as Parameters<NotesBffController['createNote']>[1],
      )
      expect(result.id).toBe('note-1')
      expect(mockService.createNote).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'Follow-up needed', authorUserId: 'user-uuid-123' }), 'tenant-1')
    })
  })

  describe('Tasks', () => {
    it('should validate task with simple date and null description', () => {
      const parsed = CreateTaskSchema.parse({ title: 'Review proposal', dueDate: '2026-09-30', description: null })
      expect(parsed.title).toBe('Review proposal')
      expect(parsed.dueDate).toBe('2026-09-30')
    })
    it('should normalize simple date to ISO string and inject assignedUserId', async () => {
      const user = { tenantId: 'tenant-1', userId: 'user-uuid-456', sub: 'user-uuid-456' }
      const result = await tasksController.createTask(
        CreateTaskSchema.parse({ title: 'Prepare deck', dueDate: '2026-09-30' }),
        user as Parameters<TasksBffController['createTask']>[1],
      )
      expect(result.id).toBe('task-1')
      expect(mockService.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Prepare deck',
          assignedUserId: 'user-uuid-456',
          dueDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        }), 'tenant-1')
    })
  })

  describe('Calls', () => {
    it('should validate call with standard date format and null summary', () => {
      const parsed = CreateCallSchema.parse({ callType: 'OUTBOUND', happenedAt: '2026-08-29', summary: null })
      expect(parsed.callType).toBe('OUTBOUND')
    })
    it('should normalize call date and inject authorUserId', async () => {
      const user = { tenantId: 'tenant-1', userId: 'user-uuid-789', sub: 'user-uuid-789' }
      const result = await callsController.createCall(
        CreateCallSchema.parse({ callType: 'OUTBOUND', happenedAt: '2026-08-29' }),
        user as Parameters<CallsBffController['createCall']>[1],
      )
      expect(result.id).toBe('call-1')
      expect(mockService.createCall).toHaveBeenCalledWith(
        expect.objectContaining({
          callType: 'OUTBOUND',
          authorUserId: 'user-uuid-789',
          happenedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        }), 'tenant-1')
    })
  })
})
