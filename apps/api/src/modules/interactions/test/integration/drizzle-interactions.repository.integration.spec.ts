import { DrizzleNoteRepository } from '../../infrastructure/drizzle-note.repository'
import { Note } from '../../domain/entities/note.entity'
import * as dbModule from '@crm/database'

describe('Interactions Repositories - Persistence Integration Tests', () => {
  let noteRepo: DrizzleNoteRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        notes: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
        tasks: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    noteRepo = new DrizzleNoteRepository()
  })

  it('should find note and map polymorphic relations', async () => {
    mockDb.query.notes.findFirst.mockResolvedValue({
      id: 'note-1',
      tenantId: 'tenant-1',
      authorUserId: 'u-1',
      contactId: 'c-1',
      dealId: 'd-1',
      content: 'Met with client regarding Q3 renewal',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const note = await noteRepo.findById('tenant-1', 'note-1')

    expect(note).not.toBeNull()
    expect(note?.content).toContain('Q3 renewal')
    expect(note?.dealId).toBe('d-1')
  })

  it('should save and delete note by tenant and id', async () => {
    const note = Note.create({
      tenantId: 'tenant-1',
      authorUserId: 'u-1',
      content: 'Follow-up call next Tuesday',
    })

    await noteRepo.save(note)
    expect(mockDb.insert).toHaveBeenCalled()

    await noteRepo.delete('tenant-1', note.id)
    expect(mockDb.delete).toHaveBeenCalled()
  })
})
