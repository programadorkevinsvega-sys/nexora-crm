import { Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { FileRepository } from '../domain/repositories/file.repository'
import { File } from '../domain/entities/file.entity'
import { OutboxService } from '../../../common/outbox/outbox.service'
import { R2Service } from '../infrastructure/storage/r2.service'
import { FileUploadedEvent, FileDeletedEvent } from '../domain/events/file.events'

export class UploadFileCommand {
  constructor(
    readonly fileName: string, readonly mimeType: string, readonly content: Buffer,
    readonly tenantId?: string, readonly uploadedByUserId?: string,
    readonly entityType?: string, readonly entityId?: string,
    readonly metadata?: Record<string, unknown>, readonly isPublic?: boolean,
  ) {}
}
export class GetFileQuery { constructor(readonly id: string, readonly tenantId?: string) {} }
export class DeleteFileCommand { constructor(readonly id: string, readonly tenantId?: string) {} }
export class ListFilesQuery {
  constructor(
    readonly tenantId?: string, readonly entityType?: string, readonly entityId?: string,
    readonly mimeType?: string, readonly uploadedByUserId?: string,
    readonly cursor?: string, readonly limit?: number,
  ) {}
}
export class GetFileUrlQuery {
  constructor(readonly id: string, readonly tenantId?: string, readonly expiresInSeconds?: number) {}
}
export class UpdateFileMetadataCommand {
  constructor(
    readonly id: string, readonly tenantId?: string, readonly entityType?: string,
    readonly entityId?: string, readonly metadata?: Record<string, unknown>,
    readonly isPublic?: boolean,
  ) {}
}

@Injectable()
export class UploadFileHandler {
  constructor(private readonly repo: FileRepository, private readonly r2: R2Service, private readonly outbox: OutboxService) {}
  async execute(cmd: UploadFileCommand): Promise<File> {
    const storageKey = `${cmd.tenantId ?? 'common'}/${randomUUID()}/${cmd.fileName}`
    const bucket = process.env.R2_BUCKET || 'crm-storage'
    await this.r2.upload(storageKey, cmd.content, cmd.mimeType, cmd.isPublic)
    const file = File.create({
      tenantId: cmd.tenantId, originalName: cmd.fileName, mimeType: cmd.mimeType,
      sizeBytes: cmd.content.length, storageKey, bucket, uploadedByUserId: cmd.uploadedByUserId,
      entityType: cmd.entityType, entityId: cmd.entityId, metadata: cmd.metadata, isPublic: cmd.isPublic,
    })
    await this.repo.save(file)
    await this.outbox.publish(new FileUploadedEvent(file.id, file.tenantId, file.originalName, file.mimeType, file.sizeBytes, file.storageKey, file.bucket, file.uploadedByUserId))
    return file
  }
}
@Injectable()
export class GetFileHandler {
  constructor(private readonly repo: FileRepository) {}
  async execute(q: GetFileQuery): Promise<File> {
    const file = await this.repo.findById(q.id)
    if (!file || file.deletedAt) throw new NotFoundException('File not found')
    if (q.tenantId && file.tenantId !== q.tenantId) throw new NotFoundException('File not found')
    return file
  }
}
@Injectable()
export class DeleteFileHandler {
  constructor(private readonly repo: FileRepository, private readonly r2: R2Service, private readonly outbox: OutboxService) {}
  async execute(cmd: DeleteFileCommand): Promise<void> {
    const file = await this.repo.findById(cmd.id)
    if (!file || file.deletedAt) throw new NotFoundException('File not found')
    if (cmd.tenantId && file.tenantId !== cmd.tenantId) throw new NotFoundException('File not found')
    await this.r2.delete(file.storageKey)
    const deleted = new File(file.id, file.tenantId, file.originalName, file.mimeType,
      file.sizeBytes, file.storageKey, file.bucket, file.uploadedByUserId,
      file.entityType, file.entityId, file.metadataJson, file.checksumSha256,
      file.isPublic, file.createdAt, new Date(), new Date())
    await this.repo.update(deleted)
    await this.outbox.publish(new FileDeletedEvent(file.id, file.tenantId, file.storageKey, file.bucket))
  }
}
@Injectable()
export class ListFilesHandler {
  constructor(private readonly repo: FileRepository) {}
  async execute(q: ListFilesQuery) { return this.repo.list(q) }
}
@Injectable()
export class GetFileUrlHandler {
  constructor(private readonly repo: FileRepository, private readonly r2: R2Service) {}
  async execute(q: GetFileUrlQuery): Promise<{ url: string; expiresIn: number }> {
    const file = await this.repo.findById(q.id)
    if (!file || file.deletedAt) throw new NotFoundException('File not found')
    if (q.tenantId && file.tenantId !== q.tenantId) throw new NotFoundException('File not found')
    const expiresIn = q.expiresInSeconds ?? 3600
    if (file.isPublic) return { url: this.r2.getPublicUrl(file.storageKey), expiresIn: 0 }
    const url = await this.r2.getSignedUrl(file.storageKey, expiresIn)
    return { url, expiresIn }
  }
}
@Injectable()
export class UpdateFileMetadataHandler {
  constructor(private readonly repo: FileRepository) {}
  async execute(cmd: UpdateFileMetadataCommand): Promise<File> {
    const file = await this.repo.findById(cmd.id)
    if (!file || file.deletedAt) throw new NotFoundException('File not found')
    if (cmd.tenantId && file.tenantId !== cmd.tenantId) throw new NotFoundException('File not found')
    const updated = new File(file.id, file.tenantId, file.originalName, file.mimeType,
      file.sizeBytes, file.storageKey, file.bucket, file.uploadedByUserId,
      cmd.entityType ?? file.entityType, cmd.entityId ?? file.entityId,
      cmd.metadata ?? file.metadataJson, file.checksumSha256,
      cmd.isPublic ?? file.isPublic, file.createdAt, new Date(), null)
    await this.repo.update(updated)
    return updated
  }
}
