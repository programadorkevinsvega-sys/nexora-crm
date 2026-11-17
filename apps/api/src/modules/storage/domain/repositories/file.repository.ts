import { File } from '../entities/file.entity'

export abstract class FileRepository {
  abstract findById(id: string): Promise<File | null>
  abstract save(file: File): Promise<void>
  abstract update(file: File): Promise<void>
  abstract list(params: {
    tenantId?: string; entityType?: string; entityId?: string
    mimeType?: string; uploadedByUserId?: string; cursor?: string; limit?: number
  }): Promise<{ data: File[]; nextCursor: string | null }>
  abstract findByStorageKey(storageKey: string): Promise<File | null>
}
