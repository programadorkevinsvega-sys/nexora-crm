import { DomainEvent } from '@crm/shared'

export class FileUploadedEvent extends DomainEvent {
  readonly aggregateType = 'file'
  readonly eventName = 'file.uploaded'
  constructor(
    readonly aggregateId: string, readonly tenantId: string | null,
    readonly originalName: string, readonly mimeType: string,
    readonly sizeBytes: number, readonly storageKey: string,
    readonly bucket: string, readonly uploadedByUserId: string | null,
  ) { super() }
  toPrimitives() {
    return { tenantId: this.tenantId, originalName: this.originalName, mimeType: this.mimeType,
      sizeBytes: this.sizeBytes, storageKey: this.storageKey, bucket: this.bucket,
      uploadedByUserId: this.uploadedByUserId }
  }
}

export class FileDeletedEvent extends DomainEvent {
  readonly aggregateType = 'file'
  readonly eventName = 'file.deleted'
  constructor(
    readonly aggregateId: string, readonly tenantId: string | null,
    readonly storageKey: string, readonly bucket: string,
  ) { super() }
  toPrimitives() { return { tenantId: this.tenantId, storageKey: this.storageKey, bucket: this.bucket } }
}
