import { File } from '../../domain/entities/file.entity'

describe('Storage Domain Entity', () => {
  it('should create file record with storage key, bucket, and size metadata', () => {
    const file = File.create({
      tenantId: 'tenant-1',
      originalName: 'Financial-Report-2026.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      sizeBytes: 1048576,
      storageKey: 'tenant-1/reports/Financial-Report-2026.xlsx',
      bucket: 'crm-prod-storage',
      uploadedByUserId: 'finance-user',
      entityType: 'reports',
      entityId: 'rep-01',
      isPublic: false,
    })

    expect(file.id).toBeDefined()
    expect(file.originalName).toBe('Financial-Report-2026.xlsx')
    expect(file.sizeBytes).toBe(1048576)
    expect(file.bucket).toBe('crm-prod-storage')
    expect(file.isPublic).toBe(false)
    expect(file.createdAt).toBeInstanceOf(Date)
  })

  it('should handle soft deletion metadata', () => {
    const file = File.create({
      tenantId: 'tenant-1',
      originalName: 'avatar.png',
      mimeType: 'image/png',
      sizeBytes: 50000,
      storageKey: 'tenant-1/avatars/avatar.png',
      bucket: 'crm-prod-storage',
    })

    expect(file.deletedAt).toBeNull()
  })
})
