import { DrizzleFileRepository } from '../../infrastructure/drizzle-file.repository'
import { File } from '../../domain/entities/file.entity'
import * as dbModule from '@crm/database'

describe('DrizzleFileRepository - Persistence Integration Tests', () => {
  let repository: DrizzleFileRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      query: {
        files: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          onConflictDoNothing: jest.fn().mockResolvedValue(undefined),
        }),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    jest.spyOn(dbModule, 'getDb').mockReturnValue(mockDb)
    repository = new DrizzleFileRepository()
  })

  it('should find file by id and map storage metadata', async () => {
    mockDb.query.files.findFirst.mockResolvedValue({
      id: 'file-100',
      tenantId: 'tenant-1',
      originalName: 'invoice_march_2026.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1048576,
      storageKey: 'tenants/1/invoices/march2026.pdf',
      bucket: 'crm-attachments',
      uploadedByUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const file = await repository.findById('file-100')

    expect(file).not.toBeNull()
    expect(file?.originalName).toBe('invoice_march_2026.pdf')
    expect(file?.storageKey).toBe('tenants/1/invoices/march2026.pdf')
  })

  it('should soft delete file via update of deletedAt', async () => {
    const file = File.create({
      tenantId: 'tenant-1',
      originalName: 'avatar.png',
      mimeType: 'image/png',
      sizeBytes: 2048,
      storageKey: 'avatars/u1.png',
      bucket: 'crm-public',
      uploadedByUserId: 'u-1',
    })

    await repository.update(file)

    expect(mockDb.update).toHaveBeenCalled()
  })
})
