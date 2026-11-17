import { randomUUID } from 'crypto'

export class File {
  constructor(
    readonly id: string, readonly tenantId: string | null,
    readonly originalName: string, readonly mimeType: string,
    readonly sizeBytes: number, readonly storageKey: string,
    readonly bucket: string, readonly uploadedByUserId: string | null,
    readonly entityType: string | null, readonly entityId: string | null,
    readonly metadataJson: Record<string, unknown> | null,
    readonly checksumSha256: string | null, readonly isPublic: boolean,
    readonly createdAt: Date, readonly updatedAt: Date,
    readonly deletedAt: Date | null,
  ) {}
  static create(props: {
    tenantId?: string; originalName: string; mimeType: string; sizeBytes: number
    storageKey: string; bucket: string; uploadedByUserId?: string
    entityType?: string; entityId?: string; metadata?: Record<string, unknown>
    checksumSha256?: string; isPublic?: boolean
  }): File {
    const now = new Date()
    return new File(randomUUID(), props.tenantId ?? null, props.originalName,
      props.mimeType, props.sizeBytes, props.storageKey, props.bucket,
      props.uploadedByUserId ?? null, props.entityType ?? null, props.entityId ?? null,
      props.metadata ?? null, props.checksumSha256 ?? null, props.isPublic ?? false,
      now, now, null)
  }
}
