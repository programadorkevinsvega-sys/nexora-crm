import { File } from '../domain/entities/file.entity'

export class FileMapper {
  static toDomain(r: any): File {
    return new File(r.id, r.tenantId, r.originalName, r.mimeType, r.sizeBytes,
      r.storageKey, r.bucket, r.uploadedByUserId, r.entityType, r.entityId,
      r.metadataJson, r.checksumSha256, r.isPublic, r.createdAt, r.updatedAt, r.deletedAt)
  }
  static toResponse(f: File) {
    return { id: f.id, tenantId: f.tenantId, originalName: f.originalName,
      mimeType: f.mimeType, sizeBytes: f.sizeBytes, storageKey: f.storageKey,
      bucket: f.bucket, uploadedByUserId: f.uploadedByUserId, entityType: f.entityType,
      entityId: f.entityId, metadata: f.metadataJson, checksumSha256: f.checksumSha256,
      isPublic: f.isPublic, createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(), deletedAt: f.deletedAt?.toISOString() ?? null }
  }
}
